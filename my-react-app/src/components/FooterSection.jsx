function FooterSection({ title, links }) {
   return (
     <div className="footer-section">
       <h4>{title}</h4>
       <ul className="footer-links">
         {links.map((link) => (
           <li key={link}><a href={`#${link.toLowerCase()}`}>{link}</a></li>
         ))}
       </ul>
     </div>
   )
 }
 export default FooterSection