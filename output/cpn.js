const fs = require('fs')
const path = require('path')
const { Connection, Request } = require("tedious")
const raw = fs.readFileSync('./csv/CPN.csv', 'utf8')
const data = raw.split(/\r?\n/)
let dataall = data.length - 1
var sSql = ""
var value_ = ""
var logger
var content_h = ""
var content_d = ""
var content_f = ""
//CIT_ReportDB_GFCCP 192.168.100.176 sa ahost!1234
//joining path of directory 
const directoryPath = path.join(__dirname, 'output');
var file_
//passsing directoryPath and callback function
fs.readdir(directoryPath, function (err, files) {
    //handling error
    if (err) {
        return console.log('Unable to scan directory: ' + err)
    }
    //listing all files using forEach
    // files.forEach(function (file) {
    //     // Do whatever you want to do with the file
    //     existingFile = true
    //     console.log(file)
    //     file_ = file
    // });
});
const executeSQL = (sql, callback) => {
    let connection = new Connection({
        "authentication": {
            "options": {
                "userName": "sa",
                "password": "ahost!1234"
            },
            "type": "default"
        },
        "server": "192.168.100.176",
        "options": {
            "validateBulkLoadParameters": false,
            "rowCollectionOnRequestCompletion": true,
            "database": "CIT_ReportDB_GFCCP",
            "encrypt": false,
            "trustServerCertificate": true
        }
    })
    connection.connect((err) => {
        if (err)
            return callback(err, null)
        const request = new Request(sql, (err, rowCount, rows) => {
            connection.close()
            if (err)
                return callback(err, null)
            callback(null, { rowCount, rows })
        })
        connection.execSql(request)
    })
}
const deleteCVS_data = (sql, callback) => {
    let connection = new Connection({
        "authentication": {
            "options": {
                "userName": "sa",
                "password": "ahost!1234"
            },
            "type": "default"
        },
        "server": "192.168.100.176",
        "options": {
            "validateBulkLoadParameters": false,
            "rowCollectionOnRequestCompletion": true,
            "database": "CIT_ReportDB_GFCCP",
            "encrypt": false,
            "trustServerCertificate": true
        }
    })
    connection.connect((err) => {
        if (err)
            return callback(err, null)
        const request = new Request(sql, (err, rowCount, rows) => {
            connection.close()
            if (err)
                return callback(err, null)
            callback(null, { rowCount, rows })
        })
        connection.execSql(request)
    })
}
const formatData = (input) => {
    if (input > 5) {
        return input
    } else return `0${input}`
}
for (let i = 1; i <= dataall; i++) {
    sSql = "INSERT INTO [dbo].[CPN_Data] ([Depositor],[PayIn],[TaxId],[Suffix],[Account],[Ref_1],[Ref_2],[RecDate],[CreateDate],[CreateBy],"
    sSql += "[Status]) VALUES ("
    let dataArray = data[i].split(",")
    value_ = "'" + dataArray[0] + "'"
    value_ += ",'" + dataArray[1] + "'"
    value_ += ",'" + dataArray[2] + "'"
    value_ += ",'" + dataArray[3] + "'"
    value_ += ",'" + dataArray[4] + "'"
    value_ += ",'" + dataArray[5] + "'"
    value_ += ",'" + dataArray[6] + "'"
    value_ += ",'" + formatData(dataArray[7]) + "'"
    value_ += ",GETDATE()"
    value_ += ",'GFCTH'"
    value_ += ",'1'"
    sSql += value_ + ")"
    //--import data from .cvs to db
    executeSQL(sSql, (err, data) => {
        if (err)
            console.error(err)
        //console.log(data.rowCount)
    })
}


const executeSQL_Select_Groupby = (sql, callback) => {
    let connection = new Connection({
        "authentication": {
            "options": {
                "userName": "sa",
                "password": "ahost!1234"
            },
            "type": "default"
        },
        "server": "192.168.100.176",
        "options": {
            "validateBulkLoadParameters": false,
            "rowCollectionOnRequestCompletion": true,
            "database": "CIT_ReportDB_GFCCP",
            "encrypt": false,
            "trustServerCertificate": true
        }
    })
    let newdata = []
    connection.connect((err) => {
        if (err)
            return callback(err, null)
        const request = new Request(sql, (err, rowCount, rows) => {
            connection.close()
            if (err) {
                return callback(err, null)
            }
            else {
                //----code command after excute sql----------------
                if (newdata.length > 0) {
                    let today_
                    let time
                    //----format date--
                    let today = new Date();
                    let yyyy = today.getFullYear();
                    let mm = today.getMonth() + 1; // Months start at 0!
                    let dd = today.getDate();
                    if (dd < 10) dd = '0' + dd;
                    if (mm < 10) mm = '0' + mm;
                    today_ = dd + mm + yyyy;
                    let TotlSumofBanknotes_GDM = 0
                    //----Time    
                    time = formatData(today.getHours()) + formatData(today.getMinutes())
                    console.log('newdata0' + newdata.length)
                    let iNum = 0
                    newdata.forEach(element => {
                        file_ = 'CPN_' + element + '_' + today_ + time + '.txt'
                        content_h = ""
                        content_d = ""
                        content_f = ""
                        sSql = "select Account,PayIn,Ref_1,Ref_2 from [dbo].[CPN_Data] where Account='" + element + "' order by id "
                        iNum++
                        executeSQL_Select(sSql, file_, today_, time, TotlSumofBanknotes_GDM, iNum, element)
                    })
                }
            }
        })
        connection.execSql(request)
        request.on('row', function (columns) {
            for (let i in columns) {
                newdata.push(columns[0].value)
            }
        })
    })
}
const executeSQL_Select = (sql, file_, today_, time, TotlSumofBanknotes_GDM, iNum, account, callback) => {
    let connection = new Connection({
        "authentication": {
            "options": {
                "userName": "sa",
                "password": "ahost!1234"
            },
            "type": "default"
        },
        "server": "192.168.100.176",
        "options": {
            "validateBulkLoadParameters": false,
            "rowCollectionOnRequestCompletion": true,
            "database": "CIT_ReportDB_GFCCP",
            "encrypt": false,
            "trustServerCertificate": true
        }
    })
    let account_ = ""
    let i = 0
    connection.connect((err) => {
        if (err)
            return callback(err, null)
        const request = new Request(sql, (err, rowCount, rows) => {
            if (err) {
                return callback(err, null)
            }
            else {
                //----code command after excute sql----------------
                console.log('iNum=' + iNum)
                content_f += '\n' + '8                    ' + (Math.round(TotlSumofBanknotes_GDM * 100) / 100).toFixed(2)
                content_f += '\n' + '9    ' + (i + 6)
                logger = fs.createWriteStream('./output/' + file_, {
                    flags: 'a' // 'a' means appending (old data will be preserved)
                })
                logger.write(content_h + content_d + content_f)
                logger.on('finish', () => {
                    console.log('wrote all data to file')
                });
            }
        })
        //********************* */
        request.on('row', function (columns) {
            //---code command excute sql-----------                        
            if (account_ === "") {

                try {
                    content_h = '1  '
                    content_h += account // append string to your fil
                    content_h += '                    Citibank                      ' + today_ + time + 'TH0000000000'
                    content_h += '\n' + '2          CENTRAL   Citibank'
                } catch (err) {
                    console.error(err)
                }
            }
            content_d += '\n' + '5          00000000                ' + (i + 1) + 'Citibank'
            content_d += '\n' + '600000000                ' + (i + 1) + '    100000000            CASH 004                                     THBCSH       ' + today_ + check_blank(parseFloat(columns[1].value).toFixed(2), 16) + parseFloat(columns[1].value).toFixed(2) + '          0004            000                 '+columns[3].value+'                                                                                   ' + columns[2].value + '                                                                        004                 ' + columns[2].value + '                                                                                                                                                                                                                                                                                                                                                                                                                  ' + columns[3].value + '   K0XX0813K0XXXXXX00000000                                                                                                         27022022                              004 ' + check_blank(parseFloat(columns[1].value).toFixed(2), 72)+parseFloat(columns[1].value).toFixed(2)
            //content_d += '\n' + '600000000                ' + (i + 1) + '    100000000            CASH 004                                     THBCSH       ' + today_ + check_blank(parseFloat(columns[1].value).toFixed(2), 16) + parseFloat(columns[1].value).toFixed(2) + '          0004            000                 00000000000000000                                                                                   ' + columns[2].value + '                                                                        004                 ' + columns[2].value + '                                                                                                                                                                                                                                                                                                                                                                                                                  ' + columns[3].value + '   K0XX0813K0XXXXXX00000000                                                                                                         27022022                              004 ' + check_blank(parseFloat(columns[1].value).toFixed(2), 72)+parseFloat(columns[1].value).toFixed(2)
            content_d += '\n' + '7          00000000                ' + (i + 1) + check_blank(parseFloat(columns[1].value).toFixed(2), 19) + parseFloat(columns[1].value).toFixed(2)
            TotlSumofBanknotes_GDM += parseFloat(columns[1].value)
            i++
            //}
        })
        //********** */ 
        request.on('done', function (rowCount, more) {
            console.log(rowCount + ' rows returned')
        });
        request.on("requestCompleted", function (rowCount, more) {
            logger = null
            content_h = ""
            content_d = ""
            content_f = ""
            deleteCVS_data("delete from [dbo].[CPN_Data]", (err, data) => {
                if (err)
                    console.error(err)
                //console.log(data.rowCount)
            })
            connection.close()
        });
        connection.execSql(request)
    })
}
sSql = "select Account from vCPN_Data_GroupBy_Acc"
executeSQL_Select_Groupby(sSql, (err, data) => {
    if (err)
        console.error(err)
})

const check_blank = (input, length_) => {
    let data = ''
    let lengthall = length_ - input.length
    for (let i = 1; i <= lengthall; i++) {
        data += ' '
    }
    return data
}
// deleteCVS_data("delete from [dbo].[CPN_Data]", (err, data) => {
//     if (err)
//         console.error(err)
//     //console.log(data.rowCount)
// })








