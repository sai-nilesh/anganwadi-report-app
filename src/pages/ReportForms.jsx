import { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

function ReportForm() {

const reportRef = useRef();

const [startDay,setStartDay]=useState(0);

const [stock,setStock]=useState({
rice:0,
dal:0,
oil:0,
eggs:0,
milk:0,
murukulu:0
});

const [stockEntries,setStockEntries]=useState([]);

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

const days=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

/* PDF EXPORT */

const exportPDF = async () => {

const element = reportRef.current;

/* force desktop width even if mobile */
const originalWidth = element.style.width;
element.style.width = "1400px";

const canvas = await html2canvas(element,{
scale:2,
windowWidth:1400,
scrollY:-window.scrollY
});

element.style.width = originalWidth;

const imgData = canvas.toDataURL("image/png");

const pdf = new jsPDF("l","mm","a4"); // landscape

const imgWidth = 297;
const pageHeight = 210;
const imgHeight = canvas.height * imgWidth / canvas.width;

let heightLeft = imgHeight;
let position = 0;

pdf.addImage(imgData,"PNG",0,position,imgWidth,imgHeight);

heightLeft -= pageHeight;

while(heightLeft > 0){

position = heightLeft - imgHeight;

pdf.addPage();

pdf.addImage(imgData,"PNG",0,position,imgWidth,imgHeight);

heightLeft -= pageHeight;

}

pdf.save("Anganwadi_Report.pdf");

};

/* BALANCE CALCULATION */

const calculateBalance=(data)=>{

let riceBal=Number(stock.rice)||0;
let dalBal=Number(stock.dal)||0;
let oilBal=Number(stock.oil)||0;
let eggBal=Number(stock.eggs)||0;
let milkBal=Number(stock.milk)||0;
let murukuluBal=Number(stock.murukulu)||0;

for(let i=0;i<data.length;i++){

const women=data[i].women||0;
const children=data[i].children||0;

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

data[i].eggsWomen=women;
data[i].eggsChildren=children;
eggBal-=women+children;
data[i].eggsBalance=eggBal;

/* MILK */

const weekday=(startDay+i)%7;
let milkPerWoman=200;

if(weekday===4||weekday===6){
milkPerWoman=300;
}

data[i].milkWomen=women*milkPerWoman;
milkBal-=data[i].milkWomen;
data[i].milkBalance=milkBal;

/* MURUKULU */

data[i].murukuluChildren=children*200;
murukuluBal-=data[i].murukuluChildren;
data[i].murukuluBalance=murukuluBal;

}

};

const handleInputChange=(index,field,value)=>{

const updated=[...rows];
updated[index][field]=Number(value);

calculateBalance(updated);
setRows(updated);

};

/* ENTER KEY NAVIGATION */

const handleKeyDown=(e,row,col)=>{

if(e.key==="Enter"){

e.preventDefault();

const next=document.querySelector(
`input[data-row="${row+1}"][data-col="${col}"]`
);

if(next){
next.focus();
}

}

};

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

useEffect(()=>{
const newRows=[...rows];
calculateBalance(newRows);
setRows(newRows);
},[stock,startDay,stockEntries]);

/* TOTALS */

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
women:0,
children:0,
riceWomen:0,
riceChildren:0,
dalWomen:0,
dalChildren:0,
oilWomen:0,
oilChildren:0,
eggsWomen:0,
eggsChildren:0,
milkWomen:0,
murukuluChildren:0
});

const last=rows[rows.length-1]||{};

return(

<div className="p-6 max-w-7xl mx-auto">

<button
onClick={exportPDF}
className="bg-green-600 text-white px-4 py-2 rounded mb-4"
>
Export PDF
</button>

<div ref={reportRef}>

<h1 className="text-2xl font-bold mb-6 text-center">
Anganwadi Food Report
</h1>

<select
className="border p-2 mb-4"
onChange={e=>setStartDay(Number(e.target.value))}
>
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
<div key={item} className="flex flex-col">

<label className="font-semibold capitalize">
{item} Stock
</label>

<input
className="border p-2 rounded"
value={stock[item]}
onChange={e=>setStock({...stock,[item]:Number(e.target.value)})}
/>

</div>
))}

</div>

{/* STOCK RECEIVED */}

<div className="mb-6">

<h2 className="font-semibold mb-2">Stock Received</h2>

<button
onClick={addStockEntry}
className="bg-blue-500 text-white px-4 py-2 rounded mb-3"
>
Add Entry
</button>

{stockEntries.map((entry,i)=>(

<div key={i} className="flex gap-2 mb-2 flex-wrap">

<input
className="border p-2"
placeholder="Day"
onChange={e=>updateStockEntry(i,"day",e.target.value)}
/>

<select
className="border p-2"
onChange={e=>updateStockEntry(i,"item",e.target.value)}
>
<option value="rice">Rice</option>
<option value="dal">Dal</option>
<option value="oil">Oil</option>
<option value="eggs">Eggs</option>
<option value="milk">Milk</option>
<option value="murukulu">Murukulu</option>
</select>

<input
className="border p-2"
placeholder="Quantity"
onChange={e=>updateStockEntry(i,"quantity",e.target.value)}
/>

</div>

))}

</div>

{/* TABLE */}

<div className="overflow-x-auto">

<table className="min-w-full text-sm border">

<thead className="bg-blue-500 text-white">

<tr>

<th>Day</th>
<th>Women</th>
<th>Children</th>

<th>Rice W</th>
<th>Rice C</th>
<th>Rice Bal</th>

<th>Dal W</th>
<th>Dal C</th>
<th>Dal Bal</th>

<th>Oil W</th>
<th>Oil C</th>
<th>Oil Bal</th>

<th>Egg W</th>
<th>Egg C</th>
<th>Egg Bal</th>

<th>Milk W</th>
<th>Milk Bal</th>

<th>Murukulu C</th>
<th>Murukulu Bal</th>

</tr>

</thead>

<tbody>

{rows.map((row,i)=>{

const weekday=days[(startDay+i)%7];

return(

<tr key={i} className="border-b text-center">

<td>{i+1} ({weekday})</td>

<td>
<input
type="number"
data-row={i}
data-col="women"
className="border w-16"
onKeyDown={(e)=>handleKeyDown(e,i,"women")}
onChange={e=>handleInputChange(i,"women",e.target.value)}
/>
</td>

<td>
<input
type="number"
data-row={i}
data-col="children"
className="border w-16"
onKeyDown={(e)=>handleKeyDown(e,i,"children")}
onChange={e=>handleInputChange(i,"children",e.target.value)}
/>
</td>

<td>{row.riceWomen}</td>
<td>{row.riceChildren}</td>
<td>{row.riceBalance}</td>

<td>{row.dalWomen}</td>
<td>{row.dalChildren}</td>
<td>{row.dalBalance}</td>

<td>{row.oilWomen}</td>
<td>{row.oilChildren}</td>
<td>{row.oilBalance}</td>

<td>{row.eggsWomen}</td>
<td>{row.eggsChildren}</td>
<td>{row.eggsBalance}</td>

<td>{row.milkWomen}</td>
<td>{row.milkBalance}</td>

<td>{row.murukuluChildren}</td>
<td>{row.murukuluBalance}</td>

</tr>

);

})}

<tr className="bg-gray-200 font-bold text-center">

<td>Total</td>

<td>{totals.women}</td>
<td>{totals.children}</td>

<td>{totals.riceWomen}</td>
<td>{totals.riceChildren}</td>
<td>{last.riceBalance}</td>

<td>{totals.dalWomen}</td>
<td>{totals.dalChildren}</td>
<td>{last.dalBalance}</td>

<td>{totals.oilWomen}</td>
<td>{totals.oilChildren}</td>
<td>{last.oilBalance}</td>

<td>{totals.eggsWomen}</td>
<td>{totals.eggsChildren}</td>
<td>{last.eggsBalance}</td>

<td>{totals.milkWomen}</td>
<td>{last.milkBalance}</td>

<td>{totals.murukuluChildren}</td>
<td>{last.murukuluBalance}</td>

</tr>

</tbody>

</table>

</div>

</div>

</div>

);

}

export default ReportForm;