 const PillItem = ({ label, name, val, fn }) => (
   <div 
     className={`pill ${val ? 'selected' : ''}`} 
     onClick={() => fn(name, !val)}
     style={{
       padding: '10px 20px',
       border: '2px solid' + (val ? '#FF758C' : '#eee'),
       borderRadius: '50px',
       cursor: 'pointer',
       backgroundColor: val ? '#FF758C' : 'white',
       color: val ? 'white' : '#444',
       fontWeight: '600',
       transition: '0.3s'
     }}
   >
     {label} {val ? '✓' : '+'}
   </div>
 );
 export default PillItem

 //??function nathi