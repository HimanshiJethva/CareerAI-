import { useState, useEffect } from "react";
import { supabase } from "../../../backend/supabaseClient";
import DashboardNavbar from "./DashboardNavbar";
import { useNavigate } from "react-router-dom";

function MyPredictionsPage() {
  const navigate = useNavigate();
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchPredictions = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('predictions')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (!error) setPredictions(data || []);
      setLoading(false);
    };
    fetchPredictions();
  }, []);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getConfidenceColor = (score) => {
    if (score >= 40) return '#22c55e';
    if (score >= 25) return '#f97316';
    return '#ef4444';
  };

  return (
    <div style={{ backgroundColor: 'var(--cream)', minHeight: '100vh' }}>
      <DashboardNavbar />

      <main style={{ maxWidth: '650px', width: '90%', margin: '0 auto', paddingTop: '105px', paddingBottom: '40px' }}>
        
        {/* Header */}
        <button onClick={() => navigate('/profile')} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontWeight: 500, marginBottom: '1rem', fontSize: '0.95rem' }}>
          ← Back to Profile
        </button>

        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', marginBottom: '0.3rem' }}>
          My Predictions
        </h2>
        <p style={{ color: '#888', marginBottom: '2rem', fontSize: '0.95rem' }}>
          Your AI-generated career predictions
        </p>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', color: '#888', padding: '3rem' }}>
            Loading predictions...
          </div>
        )}

        {/* No predictions */}
        {!loading && predictions.length === 0 && (
          <div style={{ background: 'white', borderRadius: '24px', padding: '3rem', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
            <h3 style={{ fontFamily: 'Playfair Display, serif', marginBottom: '0.5rem' }}>No Predictions Yet</h3>
            <p style={{ color: '#888', marginBottom: '1.5rem' }}>Complete the career assessment to get your AI prediction!</p>
            <button onClick={() => navigate('/dashboard')} style={{ background: '#1A1A1A', color: 'white', padding: '12px 28px', borderRadius: '50px', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
              Start Assessment →
            </button>
          </div>
        )}

        {/* Predictions List */}
        {!loading && predictions.map((pred, index) => (
          <div key={pred.id} style={{ background: 'white', borderRadius: '20px', marginBottom: '1rem', boxShadow: '0 10px 25px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            
            {/* Card Header — click to expand */}
            <div onClick={() => setExpandedId(expandedId === pred.id ? null : pred.id)}
              style={{ padding: '1.5rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <span style={{ background: '#FF6B6B', color: 'white', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>
                    #{predictions.length - index}
                  </span>
                  <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#FF6B6B' }}>
                    {pred.career_1}
                  </span>
                  <span style={{ background: '#f0fdf4', color: '#22c55e', padding: '2px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
                    Top Pick
                  </span>
                </div>
                <span style={{ color: '#888', fontSize: '0.85rem' }}>
                  🕐 {formatDate(pred.created_at)}
                </span>
              </div>

              <span style={{ color: '#ccc', fontSize: '1.3rem', transition: '0.3s', transform: expandedId === pred.id ? 'rotate(180deg)' : 'rotate(0deg)', display: 'inline-block' }}>
                ▾
              </span>
            </div>

            {/* Expanded Detail */}
            {expandedId === pred.id && (
              <div style={{ borderTop: '1px solid #f0f0f0', padding: '1.5rem' }}>
                
                {[
                  { career: pred.career_1, confidence: pred.confidence_1, explanation: pred.explanation_1, rank: 1 },
                  { career: pred.career_2, confidence: pred.confidence_2, explanation: pred.explanation_2, rank: 2 },
                  { career: pred.career_3, confidence: pred.confidence_3, explanation: pred.explanation_3, rank: 3 },
                ].map((item) => (
                  <div key={item.rank} style={{ marginBottom: '1.2rem', padding: '1rem', background: '#fafafa', borderRadius: '12px', borderLeft: `4px solid ${getConfidenceColor(item.confidence)}` }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 700, fontSize: '1rem' }}>
                        #{item.rank} {item.career}
                      </span>
                      <span style={{ background: getConfidenceColor(item.confidence), color: 'white', padding: '3px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
                        {item.confidence}% match
                      </span>
                    </div>

                    {/* Confidence Bar */}
                    <div style={{ height: '6px', background: '#eee', borderRadius: '10px', marginBottom: '8px' }}>
                      <div style={{ height: '100%', width: `${Math.min(item.confidence * 2, 100)}%`, background: getConfidenceColor(item.confidence), borderRadius: '10px', transition: '1s ease' }} />
                    </div>

                    <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
                      {item.explanation}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </main>
    </div>
  );
}

export default MyPredictionsPage;