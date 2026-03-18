 function FeatureCard({ icon, title, desc }) {
   return (
     <div className="feature-card">
       <span style={{fontSize: '3.5rem', display: 'block', marginBottom: '1.5rem'}}>{icon}</span>
       <h3 style={{fontFamily: 'Playfair Display', fontSize: '1.6rem', marginBottom: '1rem'}}>{title}</h3>
       <p style={{color: 'rgba(26,26,26,0.6)', fontSize: '1.05rem'}}>{desc}</p>
     </div>
   )
 }

 export default FeatureCard