import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function ReportForm(){

const days=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

/* ================= HEADER INFO ================= */

const [info,setInfo]=useState({
centerName:"",
village:"",
teacherName:"",
month:"",
year:""
});

const [startDay,setStartDay]=useState(0);

/* ================= OPENING STOCK ================= */

const [stock,setStock]=useState({
rice:0,
dal:0,
oil:0,
eggs:0,
milk:0,
murukulu:0
});

const [stockEntries,setStockEntries]=useState([]);
const [childEggEntries,setChildEggEntries]=useState([]);

/* ================= DAILY ROW STRUCTURE ================= */

const createRow=()=>({
women:"",
children:"",
riceWomen:0,
riceChildren:0,
riceBalance:0,
dalWomen:0,
dalChildren:0,
dalBalance:0,
oilWomen:0,
oilChildren:0,
oilBalance:0,
eggsWomen:0,
eggsChildren:0,
eggsBalance:0,
milkWomen:0,
milkBalance:0,
murukuluChildren:0,
murukuluBalance:0
});

const [rows,setRows]=useState(Array.from({length:31},createRow));

/* ================= CALCULATIONS ================= */

const calculateBalance=(data)=>{

let riceBal=Number(stock.rice)||0;
let dalBal=Number(stock.dal)||0;
let oilBal=Number(stock.oil)||0;
let eggBal=Number(stock.eggs)||0;
let milkBal=Number(stock.milk)||0;
let murukuluBal=Number(stock.murukulu)||0;

for(let i=0;i<data.length;i++){

const women=Number(data[i].women||0);
const children=Number(data[i].children||0);

const weekday=(startDay+i)%7;

/* STOCK RECEIVED */

const received=stockEntries.filter(e=>Number(e.day)===i+1);

received.forEach(e=>{
if(e.item==="rice") riceBal+=Number(e.quantity);
if(e.item==="dal") dalBal+=Number(e.quantity);
if(e.item==="oil") oilBal+=Number(e.quantity);
if(e.item==="eggs") eggBal+=Number(e.quantity);
if(e.item==="milk") milkBal+=Number(e.quantity);
if(e.item==="murukulu") murukuluBal+=Number(e.quantity);
});

/* RICE */
data[i].riceWomen=women*150;
data[i].riceChildren=children*75;
riceBal-=data[i].riceWomen+data[i].riceChildren;
data[i].riceBalance=riceBal;

/* DAL */
data[i].dalWomen=women*30;
data[i].dalChildren=children*15;
dalBal-=data[i].dalWomen+data[i].dalChildren;
data[i].dalBalance=dalBal;

/* OIL */
data[i].oilWomen=women*16;
data[i].oilChildren=children*5;
oilBal-=data[i].oilWomen+data[i].oilChildren;
data[i].oilBalance=oilBal;

/* EGGS */

/* subtract 3-6 year eggs */

const childEggGiven=childEggEntries
.filter(e=>Number(e.day)===i+1)
.reduce((sum,e)=>sum+Number(e.quantity||0),0);

eggBal-=childEggGiven;

/* Wednesday double eggs */

let eggWomen=women;
let eggChildren=children;

if(weekday===3){
eggWomen=women*2;
eggChildren=children*2;
}

data[i].eggsWomen=eggWomen;
data[i].eggsChildren=eggChildren;

eggBal-=eggWomen+eggChildren;

data[i].eggsBalance=eggBal;

/* MILK */

let milkPerWoman=200;

if(weekday===4||weekday===6) milkPerWoman=300;

data[i].milkWomen=women*milkPerWoman;
milkBal-=data[i].milkWomen;
data[i].milkBalance=milkBal;

/* MURUKULU */

data[i].murukuluChildren=children*20;
murukuluBal-=data[i].murukuluChildren;
data[i].murukuluBalance=murukuluBal;

}

};

/* ================= INPUT HANDLER ================= */

const handleInputChange=(i,field,value)=>{

const updated=[...rows];
updated[i][field]=value;

calculateBalance(updated);
setRows(updated);

};

/* ================= STOCK RECEIVED ================= */

const addStockEntry=()=>{
setStockEntries([...stockEntries,{day:"",item:"rice",quantity:""}]);
};

const updateStockEntry=(i,field,value)=>{

const updated=[...stockEntries];
updated[i][field]=value;
setStockEntries(updated);

const newRows=[...rows];
calculateBalance(newRows);
setRows(newRows);

};

/* ================= EFFECT ================= */

useEffect(()=>{
const newRows=[...rows];
calculateBalance(newRows);
setRows(newRows);
},[stock,startDay,stockEntries,childEggEntries]);

/* ================= TOTALS ================= */

const totals=rows.reduce((acc,row)=>{

acc.women+=Number(row.women||0);
acc.children+=Number(row.children||0);
acc.riceWomen+=row.riceWomen;
acc.riceChildren+=row.riceChildren;
acc.dalWomen+=row.dalWomen;
acc.dalChildren+=row.dalChildren;
acc.oilWomen+=row.oilWomen;
acc.oilChildren+=row.oilChildren;
acc.eggsWomen+=row.eggsWomen;
acc.eggsChildren+=row.eggsChildren;
acc.milkWomen+=row.milkWomen;
acc.murukuluChildren+=row.murukuluChildren;

return acc;

},{
women:0,children:0,
riceWomen:0,riceChildren:0,
dalWomen:0,dalChildren:0,
oilWomen:0,oilChildren:0,
eggsWomen:0,eggsChildren:0,
milkWomen:0,
murukuluChildren:0
});

const last=rows[rows.length-1];

/* ================= PDF EXPORT ================= */

const exportPDF=()=>{

const pdf=new jsPDF("l","mm","a4");

pdf.setFontSize(18);
pdf.text("Anganwadi Food Report",14,15);

pdf.setFontSize(12);

let y=25;

if(info.centerName){pdf.text(`Center Name: ${info.centerName}`,14,y);y+=6;}
if(info.village){pdf.text(`Village: ${info.village}`,14,y);y+=6;}
if(info.teacherName){pdf.text(`Teacher Name: ${info.teacherName}`,14,y);y+=6;}
if(info.month){pdf.text(`Month: ${info.month}`,14,y);y+=6;}
if(info.year){pdf.text(`Year: ${info.year}`,14,y);y+=6;}

let stockY=y+5;

pdf.text("Opening Stock",14,stockY);

pdf.text(`Rice: ${stock.rice}`,14,stockY+8);
pdf.text(`Dal: ${stock.dal}`,60,stockY+8);
pdf.text(`Oil: ${stock.oil}`,100,stockY+8);

pdf.text(`Eggs: ${stock.eggs}`,14,stockY+16);
pdf.text(`Milk: ${stock.milk}`,60,stockY+16);
pdf.text(`Murukulu: ${stock.murukulu}`,100,stockY+16);

let startY=stockY+30;

if(stockEntries.length>0){

pdf.text("Stock Received",14,startY);

const stockTable=stockEntries.map(entry=>[
entry.day,
entry.item,
entry.quantity
]);

autoTable(pdf,{
startY:startY+5,
head:[["Day","Item","Quantity"]],
body:stockTable,
styles:{fontSize:10},
theme:"grid"
});

startY=pdf.lastAutoTable.finalY+10;

}

const tableData=rows.map((row,i)=>{

const weekday=days[(startDay+i)%7];

return[
`${i+1} (${weekday})`,
row.women,row.children,
row.riceWomen,row.riceChildren,row.riceBalance,
row.dalWomen,row.dalChildren,row.dalBalance,
row.oilWomen,row.oilChildren,row.oilBalance,
row.eggsWomen,row.eggsChildren,row.eggsBalance,
row.milkWomen,row.milkBalance,
row.murukuluChildren,row.murukuluBalance
];

});

tableData.push([
"Total",
totals.women,totals.children,
totals.riceWomen,totals.riceChildren,last.riceBalance,
totals.dalWomen,totals.dalChildren,last.dalBalance,
totals.oilWomen,totals.oilChildren,last.oilBalance,
totals.eggsWomen,totals.eggsChildren,last.eggsBalance,
totals.milkWomen,last.milkBalance,
totals.murukuluChildren,last.murukuluBalance
]);

autoTable(pdf,{
startY:startY,
head:[[
"Day","Women","Children",
"Rice W","Rice C","Rice Bal",
"Dal W","Dal C","Dal Bal",
"Oil W","Oil C","Oil Bal",
"Egg W","Egg C","Egg Bal",
"Milk W","Milk Bal",
"Murukulu C","Murukulu Bal"
]],
body:tableData,
styles:{fontSize:8},
theme:"grid"
});

pdf.save("Anganwadi_Report.pdf");

};

/* ================= UI ================= */

return(

<div className="p-6 max-w-7xl mx-auto">

<button
onClick={exportPDF}
className="bg-green-600 text-white px-4 py-2 rounded mb-4"

>

Export PDF </button>

<h1 className="text-2xl font-bold text-center mb-6">
Anganwadi Food Report
</h1>

{/* HEADER INPUTS */}

<div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">

<input className="border p-2" placeholder="Center Name"
value={info.centerName}
onChange={(e)=>setInfo({...info,centerName:e.target.value})}/>

<input className="border p-2" placeholder="Village"
value={info.village}
onChange={(e)=>setInfo({...info,village:e.target.value})}/>

<input className="border p-2" placeholder="Teacher Name"
value={info.teacherName}
onChange={(e)=>setInfo({...info,teacherName:e.target.value})}/>

<select className="border p-2"
value={info.month}
onChange={(e)=>setInfo({...info,month:e.target.value})}>

<option value="">Select Month</option>
<option>January</option>
<option>February</option>
<option>March</option>
<option>April</option>
<option>May</option>
<option>June</option>
<option>July</option>
<option>August</option>
<option>September</option>
<option>October</option>
<option>November</option>
<option>December</option>
</select>

<input className="border p-2" placeholder="Year"
value={info.year}
onChange={(e)=>setInfo({...info,year:e.target.value})}/>

</div>

{/* START DAY */}

<select className="border p-2 mb-4"
onChange={e=>setStartDay(Number(e.target.value))}>

<option value={0}>Month starts Sunday</option>
<option value={1}>Monday</option>
<option value={2}>Tuesday</option>
<option value={3}>Wednesday</option>
<option value={4}>Thursday</option>
<option value={5}>Friday</option>
<option value={6}>Saturday</option>
</select>

{/* OPENING STOCK */}

<div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">

{Object.keys(stock).map(item=>(

<div key={item}>
<label className="font-semibold capitalize">{item} Stock</label>

<input className="border p-2 w-full"
value={stock[item]}
onChange={e=>setStock({...stock,[item]:Number(e.target.value)})}/>

</div>

))}

</div>

{/* STOCK RECEIVED */}

<div className="mb-6">

<h2 className="font-semibold mb-2">Stock Received</h2>

<button
onClick={addStockEntry}
className="bg-blue-500 text-white px-3 py-1 rounded mb-2"

>

Add Entry </button>

{stockEntries.map((entry,i)=>(

<div key={i} className="flex gap-2 mb-2">

<input className="border p-1" placeholder="Day"
value={entry.day}
onChange={e=>updateStockEntry(i,"day",e.target.value)}/>

<select className="border p-1"
value={entry.item}
onChange={e=>updateStockEntry(i,"item",e.target.value)}>

<option value="rice">Rice</option>
<option value="dal">Dal</option>
<option value="oil">Oil</option>
<option value="eggs">Eggs</option>
<option value="milk">Milk</option>
<option value="murukulu">Murukulu</option>

</select>

<input className="border p-1" placeholder="Quantity"
value={entry.quantity}
onChange={e=>updateStockEntry(i,"quantity",e.target.value)}/>

</div>

))}

</div>

{/* 3-6 YEAR CHILD EGGS */}

<div className="mb-6">

<h2 className="font-semibold mb-2">3-6 Year Egg Distribution</h2>

<button
onClick={()=>setChildEggEntries([...childEggEntries,{day:"",quantity:""}])}
className="bg-purple-500 text-white px-3 py-1 rounded mb-2"

>

Add Entry </button>

{childEggEntries.map((entry,i)=>(

<div key={i} className="flex gap-2 mb-2">

<input className="border p-1" placeholder="Day"
value={entry.day}
onChange={e=>{
const updated=[...childEggEntries];
updated[i].day=e.target.value;
setChildEggEntries(updated);
}}/>

<input className="border p-1" placeholder="Egg Quantity"
value={entry.quantity}
onChange={e=>{
const updated=[...childEggEntries];
updated[i].quantity=e.target.value;
setChildEggEntries(updated);
}}/>

</div>

))}

</div>
 
 {/* TABLE */}

<div className="overflow-x-auto">

<table className="min-w-full border text-xs">

<thead className="bg-blue-200">

<tr>

<th className="border p-1">Day</th>
<th className="border p-1">Women</th>
<th className="border p-1">Children</th>
<th className="border p-1">Rice W</th>
<th className="border p-1">Rice C</th>
<th className="border p-1">Rice Bal</th>
<th className="border p-1">Dal W</th>
<th className="border p-1">Dal C</th>
<th className="border p-1">Dal Bal</th>
<th className="border p-1">Oil W</th>
<th className="border p-1">Oil C</th>
<th className="border p-1">Oil Bal</th>
<th className="border p-1">Egg W</th>
<th className="border p-1">Egg C</th>
<th className="border p-1">Egg Bal</th>
<th className="border p-1">Milk W</th>
<th className="border p-1">Milk Bal</th>
<th className="border p-1">Murukulu C</th>
<th className="border p-1">Murukulu Bal</th>

</tr>

</thead>

<tbody>

{rows.map((row,i)=>{

const weekday=days[(startDay+i)%7];

return(

<tr key={i}>

<td className="border p-1">{i+1} ({weekday})</td>

<td className="border p-1">
<input
type="number"
value={row.women}
onChange={(e)=>handleInputChange(i,"women",e.target.value)}
className="w-16 text-center"
/>
</td>

<td className="border p-1">
<input
type="number"
value={row.children}
onChange={(e)=>handleInputChange(i,"children",e.target.value)}
className="w-16 text-center"
/>
</td>

<td className="border p-1">{row.riceWomen}</td>
<td className="border p-1">{row.riceChildren}</td>
<td className="border p-1">{row.riceBalance}</td>

<td className="border p-1">{row.dalWomen}</td>
<td className="border p-1">{row.dalChildren}</td>
<td className="border p-1">{row.dalBalance}</td>

<td className="border p-1">{row.oilWomen}</td>
<td className="border p-1">{row.oilChildren}</td>
<td className="border p-1">{row.oilBalance}</td>

<td className="border p-1">{row.eggsWomen}</td>
<td className="border p-1">{row.eggsChildren}</td>
<td className="border p-1">{row.eggsBalance}</td>

<td className="border p-1">{row.milkWomen}</td>
<td className="border p-1">{row.milkBalance}</td>

<td className="border p-1">{row.murukuluChildren}</td>
<td className="border p-1">{row.murukuluBalance}</td>

</tr>

);

})}

<tr className="bg-gray-200 font-bold">

<td className="border p-1">Total</td>
<td className="border p-1">{totals.women}</td>
<td className="border p-1">{totals.children}</td>

<td className="border p-1">{totals.riceWomen}</td>
<td className="border p-1">{totals.riceChildren}</td>
<td className="border p-1">{last.riceBalance}</td>

<td className="border p-1">{totals.dalWomen}</td>
<td className="border p-1">{totals.dalChildren}</td>
<td className="border p-1">{last.dalBalance}</td>

<td className="border p-1">{totals.oilWomen}</td>
<td className="border p-1">{totals.oilChildren}</td>
<td className="border p-1">{last.oilBalance}</td>

<td className="border p-1">{totals.eggsWomen}</td>
<td className="border p-1">{totals.eggsChildren}</td>
<td className="border p-1">{last.eggsBalance}</td>

<td className="border p-1">{totals.milkWomen}</td>
<td className="border p-1">{last.milkBalance}</td>

<td className="border p-1">{totals.murukuluChildren}</td>
<td className="border p-1">{last.murukuluBalance}</td>

</tr>

</tbody>

</table>

</div>
</div>

);

}

export default ReportForm;
