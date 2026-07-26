const mongoose = require("mongoose");
const QRCode = require("qrcode");
const Table = require("../models/Table");


mongoose.connect(
"mongodb://127.0.0.1:27017/coffee_corner"
);



const tables = [
"TABLE-001",
"TABLE-002",
"TABLE-003",
"TABLE-004",
"TABLE-005",
];



async function createTables(){

for(const table of tables){


const url =
`coffeeapp://table/${table}`;


const qr =
await QRCode.toDataURL(url);



await Table.findOneAndUpdate(
{
tableNumber:table
},
{
tableNumber:table,
qrCode:qr
},
{
upsert:true
}
);


console.log(
"Created",
table
);


}


mongoose.disconnect();

}


createTables();