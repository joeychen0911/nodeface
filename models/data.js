var mysql = require('mysql');


//Update mysql connection based on running environment
if (process.env.VCAP_SERVICES) {
    var mysqlVariables = process.env.VCAP_SERVICES.cleardb;
    var DB_NAME = mysqlVariables.credentials.name;
    var pool = mysql.createPool({
        host: mysqlVariables.credentials.hostname,
        user: mysqlVariables.credentials.username,
        password: mysqlVariables.credentials.password,
        database: DB_NAME
    })
}
else {
    var DB_NAME = "nodeface";
    var pool = mysql.createPool({
        host: 'localhost',
        user: 'test',
        password: '1234',
        database: DB_NAME
    });
};


/*var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'test',
    password : '1234',
    port     : '3306',
    database : 'nodesample'
})
*/

pool.on('connection', function (connection) {
    connection.query('SET SESSION auto_increment_increment=1');
});

function Data() { };

module.exports = Data;



pool.getConnection(function (err, connection) {
    //use database
    var useDbSql = "USE " + DB_NAME;
    connection.query(useDbSql, function (err) {
        if (err) {
            console.log("USE Error: " + err.message);
            return;
        }
        connection.release();
        console.log('USE succeed');
    });

});

Data.log = function log(logItem, callback) {

    var insertLog_Sql = "insert into tbl_log select ?, now();";
    var insertLog_Params = logItem;

    pool.getConnection(function (err, connection) {
        connection.query(insertLog_Sql, insertLog_Params, function (err, result) {
            if (err) {
                console.log("insertLog_Sql Error: " + err.message);
                return;
            }
            connection.release();
            console.log("invoked[Log]");
            callback(err, result.message);
        });
    });


    /*pool.query(insertLog_Sql, insertLog_Params, function (err, result) {
        if (err) {
            console.log("insertLog_Sql Error: " + err.message);
            return;
        }
        console.log("invoked[Log]");
        callback(err, result.message);
    });
    */
};


Data.getResult = function getResult(gender, age, smiling, race, glass, callback) {
    var getResult_Sql = ["select tr.id as result_id, tr.result_name, tr.result_desc, tr.web_title, tr.web_content, tr.img_url",
        "from (select * from",
        "(select output as gender_id from tbl_dict where type = 'gender' and criteria_from = ?) a",
        "join",
        "(select output as age_id from tbl_dict where type = 'age' and ? between criteria_from and criteria_to) b",
        "join",
        "(select output as smiling_id from tbl_dict where type = 'smiling' and ? between criteria_from and criteria_to) c",
        "join",
        "(select output as race_id from tbl_dict where type = 'race' and criteria_from = ?) d",
        "join",
        "(select output as glass_id from tbl_dict where type = 'glass' and criteria_from = ?) e",
        ")r inner join tbl_mapping m ",
        "on r.gender_id = m.gender ",
        "and r.age_id = m.age ",
        "and r.smiling_id = m.smiling ",
        "and r.race_id = m.race",
        "and r.glass_id = m.glass",
        "inner join tbl_result tr",
        "on m.result_id = tr.id",
        ";"].join(' ');

    //console.log(getResult_Sql);

    var getResult_Params = [gender, age, smiling, race, glass];


    pool.getConnection(function (err, connection) {
        connection.query(getResult_Sql, getResult_Params, function (err, rows, result) {
            //connection.query(getResult_Sql, function (err,result) {
            console.log("invoked[getResult]");
            if (err) {
                console.log("getResult_Sql Error: " + err.message);
                callback(err);
                return;
            }
            if (!rows || !rows[0]) {
                console.log("No Car Suggestion Result Returned");
            }
            else {
                console.log("Car Suggestion Result:");
                console.log(rows[0]);
                callback(err, rows);
                return;
            };
        });
        connection.release();
    });



    /*connection.query(getResult_Sql, getResult_Params, function (err, rows, result) {
        //connection.query(getResult_Sql, function (err,result) {
        console.log("invoked[getResult]");
        if (err) {
            console.log("getResult_Sql Error: " + err.message);
            callback(err);
            return;
        }
        if (!rows || !rows[0]) {
            console.log("No Car Suggestion Result Returned");
        }
        else {
            console.log("Car Suggestion Result:");
            console.log(rows[0]);
            callback(err, rows);
            return;
        };
    });
    */
};
