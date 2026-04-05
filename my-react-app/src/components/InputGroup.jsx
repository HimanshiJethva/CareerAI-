const InputGroup = ({ label, name, val, fn }) => (
   <div className="marks-input-group">
     <label>{label}</label>
     <input type="number" value={val} onChange={(e) => fn(name, e.target.value)} placeholder="0-100" />
   </div>
 );
 export default InputGroup

 //???funtion nthi