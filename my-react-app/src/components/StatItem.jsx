function StatItem({ label, value, width }) {
   return (
     <div className="stat-item">
       <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: 'bold'}}>
         <span style={{color: 'rgba(26,26,26,0.5)', fontSize: '0.85rem'}}>{label}</span>
         <span style={{fontFamily: 'Playfair Display', fontSize: '1.5rem'}}>{value}</span>
       </div>
       <div className="stat-bar"><div className="stat-fill" style={{ width: width }}></div></div>
     </div>
   )
 }

 export default StatItem