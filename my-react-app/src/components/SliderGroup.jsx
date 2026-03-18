 const SliderGroup = ({ label, name, val, fn }) => (
   <div className="slider-group">
     <label>{label}: <span>{val}</span></label>
     <input type="range" min="1" max="5" step="0.5" value={val} onChange={(e) => fn(name, e.target.value)} />
   </div>
 );

 export default SliderGroup

 //??fucntion nathi
 