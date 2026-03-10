import { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

function ReportForm(){

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


/* PDF EXPORT FIXED */

const exportPDF = async ()=>{

const element = reportRef.current;

const originalWidth = element.style.width;
element.style.width="1400px";

const canvas = await html2canvas(element,{
scale:3,
useCORS:true,
windowWidth:1400
});

element.style.width=originalWidth;

const imgData = canvas.toDataURL("image/png");

const pdf = new jsPDF("l","mm","a4");

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

/* rice */

data[i].riceWomen=women*150;
data[i].riceChildren=children*75;
riceBal-=data[i].riceWomen+data[i].riceChildren;
data[i].riceBalance=riceBal;

/* dal */

data[i].dalWomen=women*30;
data[i].dalChildren=children*15;
dalBal-=data[i].dalWomen+data[i].dalChildren;
data[i].dalBalance=dalBal;

/* oil */

data[i].oilWomen=women*16;
data[i].oilChildren=children*5;
oilBal-=data[i].oilWomen+data[i].oilChildren;
data[i].oilBalance=oilBal;

/* eggs */

data[i].eggsWomen=women;
data[i].eggsChildren=children;
eggBal-=women+children;
data[i].eggsBalance=eggBal;

/* milk */

const weekday=(startDay+i)%7;
let milkPerWoman=200;

if(weekday===4||weekday===6){
milkPerWoman=300;
}

data[i].milkWomen=women*milkPerWoman;
milkBal-=data[i].milkWomen;
data[i].milkBalance=milkBal;

/* murukulu */

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


const handleKeyDown=(e,row,col)=>{

if(e.key==="Enter"){

e.preventDefault();

const next=document.querySelector(
`input[data-row="${row+1}"][data-col="${col}"]`
);

if(next) next.focus();

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


// eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(()=>{
const newRows=[...rows];
calculateBalance(newRows);
setRows(newRows);
},[stock,startDay,stockEntries]);


/* totals */

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

<div className="overflow-x-auto">

<table className="min-w-full border text-sm border-collapse">

<thead className="bg-blue-500 text-white">

<tr>

<th className="p-2 border">Day</th>
<th className="p-2 border">Women</th>
<th className="p-2 border">Children</th>

<th className="p-2 border">Rice W</th>
<th className="p-2 border">Rice C</th>
<th className="p-2 border">Rice Bal</th>

<th className="p-2 border">Dal W</th>
<th className="p-2 border">Dal C</th>
<th className="p-2 border">Dal Bal</th>

<th className="p-2 border">Oil W</th>
<th className="p-2 border">Oil C</th>
<th className="p-2 border">Oil Bal</th>

<th className="p-2 border">Egg W</th>
<th className="p-2 border">Egg C</th>
<th className="p-2 border">Egg Bal</th>

<th className="p-2 border">Milk W</th>
<th className="p-2 border">Milk Bal</th>

<th className="p-2 border">Murukulu C</th>
<th className="p-2 border">Murukulu Bal</th>

</tr>

</thead>

<tbody>

{rows.map((row,i)=>{

const weekday=days[(startDay+i)%7];

return(

<tr key={i} className="text-center">

<td className="p-2 border">{i+1} ({weekday})</td>

<td className="p-2 border">
<input
type="number"
data-row={i}
data-col="women"
className="border w-16 text-center"
onKeyDown={(e)=>handleKeyDown(e,i,"women")}
onChange={e=>handleInputChange(i,"women",e.target.value)}
/>
</td>

<td className="p-2 border">
<input
type="number"
data-row={i}
data-col="children"
className="border w-16 text-center"
onKeyDown={(e)=>handleKeyDown(e,i,"children")}
onChange={e=>handleInputChange(i,"children",e.target.value)}
/>
</td>

<td className="p-2 border">{row.riceWomen}</td>
<td className="p-2 border">{row.riceChildren}</td>
<td className="p-2 border">{row.riceBalance}</td>

<td className="p-2 border">{row.dalWomen}</td>
<td className="p-2 border">{row.dalChildren}</td>
<td className="p-2 border">{row.dalBalance}</td>

<td className="p-2 border">{row.oilWomen}</td>
<td className="p-2 border">{row.oilChildren}</td>
<td className="p-2 border">{row.oilBalance}</td>

<td className="p-2 border">{row.eggsWomen}</td>
<td className="p-2 border">{row.eggsChildren}</td>
<td className="p-2 border">{row.eggsBalance}</td>

<td className="p-2 border">{row.milkWomen}</td>
<td className="p-2 border">{row.milkBalance}</td>

<td className="p-2 border">{row.murukuluChildren}</td>
<td className="p-2 border">{row.murukuluBalance}</td>

</tr>

);

})}

<tr className="bg-gray-200 font-bold text-center">

<td className="p-2 border">Total</td>

<td className="p-2 border">{totals.women}</td>
<td className="p-2 border">{totals.children}</td>

<td className="p-2 border">{totals.riceWomen}</td>
<td className="p-2 border">{totals.riceChildren}</td>
<td className="p-2 border">{last.riceBalance}</td>

<td className="p-2 border">{totals.dalWomen}</td>
<td className="p-2 border">{totals.dalChildren}</td>
<td className="p-2 border">{last.dalBalance}</td>

<td className="p-2 border">{totals.oilWomen}</td>
<td className="p-2 border">{totals.oilChildren}</td>
<td className="p-2 border">{last.oilBalance}</td>

<td className="p-2 border">{totals.eggsWomen}</td>
<td className="p-2 border">{totals.eggsChildren}</td>
<td className="p-2 border">{last.eggsBalance}</td>

<td className="p-2 border">{totals.milkWomen}</td>
<td className="p-2 border">{last.milkBalance}</td>

<td className="p-2 border">{totals.murukuluChildren}</td>
<td className="p-2 border">{last.murukuluBalance}</td>

</tr>

</tbody>

</table>

</div>

</div>

</div>

);

}

export default ReportForm;