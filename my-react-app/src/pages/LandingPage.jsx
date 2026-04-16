import StatItem from "../components/StatItem"
import FeatureCard from "../components/FeatureCard"
import FooterSection from "../components/FooterSection"
import InputGroup from "../components/InputGroup"
import PillItem from "../components/PillItem"
import PredictionBox from "../components/PredictionBox"
import ProcessStep from "../components/ProcessStep"
import SliderGroup from "../components/SliderGroup"
import TestimonialCard from "../components/TestimonialCard"
import hero_students from "../assets/hero_students.png"
function LandingPage({setView})
{
    return (
        <div className="app-container">
        {/* HEADER */}
        <header>
            <nav>
            <a href="#" className="logo">CareerAI</a>
            <ul className="nav-links">
                <li><a href="#features">Features</a></li>
                <li><a href="#how-it-works">How It Works</a></li>
                <li><a href="#testimonials">Stories</a></li>
                <li><button className="nav-cta" onClick={()=>setView('login')}>Get Started</button></li>
            </ul>
            </nav>
        </header>

        {/* HERO SECTION */}
        <section className="hero">
            <div className="hero-content">
            <div className="hero-text">
                <h1>Predict Your <span className="accent">Perfect Career</span> With AI</h1>
                <p>Don't guess your future. Let our advanced AI analyze your 
                        Marks, Personality, and Interests to give you a scientific roadmap.</p>
                <div className="hero-buttons">
                <button className="btn-primary" onClick={()=>setView("login")}>Start Free Prediction</button>
                </div>
            </div>
             <div className="hero-visual">
                <img src={hero_students} alt="Career AI" className="hero-main-img" />
            </div>
            </div>
        </section>

        {/* FEATURES SECTION */}
        <section id="features" className="features">
             <div  style={{ textAlign: 'center', marginBottom: '3rem' }}>
            {/* Eyebrow Text */}
            <p style={{ color: 'var(--coral)', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase' }}>
              WHY CHOOSE US
            </p>
            
            {/* Heading (HTML wala text) */}
            <h2 style={{ fontFamily: 'Playfair Display', fontSize: '3.5rem', marginTop: '1rem', color: 'var(--charcoal)' }}>
              Exceptional Features, Exceptional Results
            </h2>

            {/* Subtitle (Jo HTML mein tha) */}
            <p style={{ 
              fontSize: '1.2rem', 
              color: '#666', 
              maxWidth: '800px', 
              margin: '1rem auto 0', 
              lineHeight: '1.6' 
            }}>
              Powered by cutting-edge AI technology and refined through thousands of successful career transitions
            </p>
          </div>
            <div className="features-grid">
          <FeatureCard icon="🎯" title="Precision Matching" desc="Advanced algorithms analyze 100+ data points from your profile to deliver remarkably accurate career predictions." />
          <FeatureCard icon="📊" title="Beautiful Insights" desc="Interactive visualizations transform complex data into clear, actionable insights you can understand at a glance." />
          <FeatureCard icon="🚀" title="Instant Results" desc="Receive comprehensive predictions in seconds, not days. Your future career path is just moments away." />
          <FeatureCard icon="🎓" title="Skill Roadmaps" desc="Get personalized learning paths showing exactly which skills to develop for your target career."/>
          <FeatureCard icon="🔒" title="Complete Privacy" desc="Your data is encrypted and never shared. Your career journey remains completely confidential."/>
          <FeatureCard icon="💡" title="Expert Guidance" desc="Benefit from insights derived from analyzing millions of successful career transitions worldwide."/>
        </div>  
        </section>

        {/* SHOWCASE SECTION */}
        {/* <section className="showcase">
            <div className="showcase-content">
            <div className="showcase-text">
                <h2 style={{fontFamily: 'Playfair Display', fontSize: '3.5rem', marginBottom: '2rem'}}>See Your Future Unfold</h2>
                <p style={{fontFamily: 'Fraunces', fontSize: '1.3rem', color: 'rgba(255,255,255,0.8)'}}>
                Experience how our AI technology transforms your profile into clear career predictions.
                </p>
            </div>
            <div className="prediction-preview">
                <PredictionBox name="🥇 Machine Learning Engineer" score="87%" />
                <PredictionBox name="🥈 Data Scientist" score="82%" />
                <PredictionBox name="🥉 Full Stack Developer" score="76%" />
            </div>
            </div>
        </section> */}
        {/* PROCESS SECTION */}
    <section className="process" id="how-it-works">
    <div  style={{textAlign: 'center', marginBottom: '4rem'}}>
        <p style={{color: 'var(--coral)', fontWeight: 'bold', letterSpacing: '2px'}}>SIMPLE PROCESS</p>
        <h2 style={{fontFamily: 'Playfair Display', fontSize: '3.5rem', marginTop: '1rem'}}>Four Steps to Your Dream Career</h2>
        <p style={{fontFamily: 'Fraunces', fontSize: '1.3rem', color: 'rgba(26,26,26,0.6)'}}>A streamlined journey from curiosity to clarity in just minutes</p>
    </div>

    <div className="process-grid">
        <ProcessStep 
            num="1" 
            title="Share Your Story" 
            desc="Tell us about your skills, experience, education, and career goals" 
        />
        <ProcessStep 
            num="2" 
            title="AI Analysis" 
            desc="Our algorithms process your profile against thousands of career patterns" 
        />
        <ProcessStep 
            num="3" 
            title="Review Results" 
            desc="Explore predictions with confidence scores and detailed breakdowns" 
        />
        <ProcessStep 
            num="4" 
            title="Take Action" 
            desc="Follow your personalized roadmap to achieve your career goals" 
        />
        </div>
    </section>
        {/* TESTIMONIALS SECTION */}
    <section className="testimonials" id="testimonials">
        <div style={{textAlign: 'center', marginBottom: '4rem'}}>
            <p style={{color: 'var(--coral)', fontWeight: '700', letterSpacing: '2px'}}>SUCCESS STORIES</p>
            <h2 style={{fontFamily: 'Playfair Display', fontSize: '3.5rem', marginTop: '1rem'}}>Loved By Thousands</h2>
        </div>

        <div className="testimonials-grid">
          <TestimonialCard 
              text="This tool completely changed my career trajectory. I was stuck between multiple paths, but the AI predictions gave me the clarity I needed. Now I'm thriving as an ML Engineer at Google." 
              initials="PS" name="Priya Sharma" 
          />
          <TestimonialCard 
              text="The personalized skill roadmap was incredible. It showed me exactly what to learn, and within 6 months I landed my dream role as a Data Scientist. Absolutely life-changing!" 
              initials="AK" name="Amit Kumar" 
          />
          <TestimonialCard 
              text="I was amazed by how accurate the predictions were. The visual analytics made everything crystal clear. This is genuinely the best career guidance tool I've ever used." 
              initials="SK" name="Sneha Kapoor" 
          />
      </div>
    </section>

    {/* CTA SECTION */}
    <section className="cta-section">
        <div style={{maxWidth: '900px', margin: '0 auto'}}>
            <h2 style={{fontFamily: 'Playfair Display', fontSize: '4rem', marginBottom: '1.5rem'}} >Your Dream Career Awaits</h2>
            <p style={{fontSize: '1.4rem', opacity: '0.95'}}>Join 50,000+ professionals who discovered their perfect path. Start today—free, forever.</p>
            <button className="cta-button" onClick={()=>setView("login")} >Get Your Free Prediction</button>
        </div>
    </section>
        {/* FOOTER */}
        {/* FOOTER */}
    <footer>
        <div className="footer-content">
            <div className="footer-brand">
                <h3>CareerAI</h3>
                <p>Empowering professionals worldwide to discover and pursue their ideal careers through cutting-edge AI technology.</p>
                <div className="social-icons">
                    <div className="social-icon">📘</div>
                    <div className="social-icon">🐦</div>
                    <div className="social-icon">💼</div>
                    <div className="social-icon">📸</div>
                </div>
            </div>

            <FooterSection title="Product" links={['Features', 'Pricing', 'API', 'Case Studies']} />
            <FooterSection title="Company" links={['About', 'Careers', 'Blog', 'Contact']} />
            <FooterSection title="Legal" links={['Privacy', 'Terms', 'Security', 'GDPR']} />
        </div>

        <div className="footer-bottom">
            <p>©2026 CareerAI. Made with ❤️ in India</p>
        </div>
    </footer>
        </div>
    )
}

export default LandingPage