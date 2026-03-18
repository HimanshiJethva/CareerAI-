function TestimonialCard({ text, initials, name, role }) {
   return (
     <div className="testimonial-card">
       <p style={{fontFamily: 'Fraunces', fontSize: '1.15rem', marginBottom: '2.5rem', color: '#444'}}>"{text}"</p>
       <div style={{display: 'flex', alignItems: 'center'}}>
         <div className="author-image">{initials}</div>
         <div style={{textAlign: 'left'}}>
           <div style={{fontWeight: '700'}}>{name}</div>
           <div style={{color: 'rgba(26, 26, 26, 0.5)', fontSize: '0.9rem'}}>{role}</div>
         </div>
       </div>
     </div>
   )
 }

 export default TestimonialCard