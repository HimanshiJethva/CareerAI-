 function PredictionBox({ name, score }) {
   return (
     <div className="prediction-item">
       <span style={{ fontSize: '1.3rem', fontWeight: '700' }}>{name}</span>
       <span style={{ fontSize: '2rem', color: '#FF6B6B', fontWeight: '900', fontFamily: 'Playfair Display' }}>{score}</span>
     </div>
   )
 }

 export default PredictionBox