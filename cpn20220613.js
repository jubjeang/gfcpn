var fs = require('fs')
const path = 'log.txt'
//---delete file
if (fs.existsSync(path)) 
{
    try {
        fs.unlinkSync(path)
    } catch(err) 
    {
        console.error(err)
    }
}
//***** */
var Connection = require('tedious').Connection;  
var config = {  
    server: '192.168.100.28',  //update me
    authentication: {
        type: 'default',
        options: {
            userName: 'rcdadmin',
            password: 'rcd2017$',
            encrypt: false,
            trustServerCertificate: true
        }
    },
    options: {
        // If you are on Microsoft Azure, you need encryption:
        encrypt: true,
        trustServerCertificate: true,
        database: 'cit_kun'  //update me
    }
}; 
var connection = new Connection(config);  
connection.on('connect', function(err) {  
    // If no error, then good to proceed.  
    console.log("Connected");  
    console.log( executeStatement('select Account1 as Account_,tcreatedFilter from [dbo].[CPN] where Account1=0421132313') );
});  

connection.connect();

var Request = require('tedious').Request;  
var TYPES = require('tedious').TYPES;  

function executeStatement(sql_) {  
    request = new Request(sql_, function(err) {  
    if (err) {  
        console.log(err);}  
    });  
    var result = "";  
    var newdata = [];
    request.on('row', function(columns) {  
        let o = {};
        for (let i in columns) {
            o[columns[i].metadata.colName]=columns[i].value;
        }
        //console.log(o);        
        newdata.push(columns[0].value,o);
        // myReturn.push(o);
        // result+= columns[0].value+" "+columns[1].value + " ";  
        // newdata.push( columns[0].value+" "+columns[1].value + " " );
        // columns.forEach(function(column) {  
        //   if (column.value === null) {  
        //     console.log('NULL');  
        //   } else {  
        //     result+= column.value + " ";  
        //   }  
        // });  
        //console.log(result);  
        //result ="";  
    });  
    //resolve(newdata);
    request.on('done', function(rowCount, more) {  
    console.log(rowCount + ' rows returned');  
    });  
    
    // Close the connection after the final event emitted by the request, after the callback passes
    request.on("requestCompleted", function (rowCount, more) {
        connection.close();
    });
    connection.execSql(request);  
    // var logger = fs.createWriteStream('log.txt', {
    //     flags: 'a' // 'a' means appending (old data will be preserved)
    // })

    // logger.write('1  ', 'base64') // append string to your file
    // logger.write( global.Account1, 'base64' ) // append string to your file
    // logger.write( '                    '+global.tcreatedFilter, 'base64' )
    // logger.on('finish', () => {
    //     console.log('wrote all data to file');
    // });
    return newdata;
}  