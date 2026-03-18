function ProcessStep({ num, title, desc }) {
   return (
     <div className="process-step">
       <div className="step-number">{num}</div>
       <h3 className="step-title">{title}</h3>
       <p className="step-description">{desc}</p>
     </div>
   )
 }
 export default ProcessStep