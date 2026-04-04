import { useState } from 'react';
import axios from 'axios';
import { UploadCloud, CheckCircle2, AlertCircle } from 'lucide-react';
import './App.css';

function App() {
  const [formData, setFormData] = useState({
    year: 2018,
    present_price: 5.5,
    kms_driven: 30000,
    fuel_type: 1, // Defaulting to Petrol/Diesel
    seller_type: 0, // 0 Dealer
    transmission: 1, // 1 Manual
    owner: 0
  });
  
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: Number(value)
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please upload a picture of the car to estimate damages.");
      return;
    }
    
    setError('');
    setLoading(true);
    setResult(null);

    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      submitData.append(key, formData[key]);
    });
    submitData.append('image', file);

    try {
      const response = await axios.post('http://localhost:8000/predict', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        setResult(response.data);
      } else {
        setError(response.data.error || "Estimation failed.");
      }
    } catch (err) {
      setError("Could not connect to the backend server. Make sure it is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header>
        <img src="/logo.png" alt="PriceDekho Logo" className="logo-img" />
      </header>

      <main className="main-layout">
        <section className="glass-card">
          <h2 className="card-title">Car Evaluation Engine</h2>
          <form onSubmit={handleSubmit}>
            
            <div className="form-group">
              <label>Purchase Year: {formData.year}</label>
              <div className="slider-container">
                <span>2000</span>
                <input 
                  type="range" className="slider" name="year" 
                  min="2000" max="2024" step="1"
                  value={formData.year} onChange={handleInputChange} 
                />
                <span>2024</span>
              </div>
            </div>

            <div className="form-group">
              <label>Kms Driven: {formData.kms_driven.toLocaleString()} km</label>
              <div className="slider-container">
                <span>0</span>
                <input 
                  type="range" className="slider" name="kms_driven" 
                  min="0" max="200000" step="1000"
                  value={formData.kms_driven} onChange={handleInputChange} 
                />
                <span>2L+</span>
              </div>
            </div>

            <div className="form-group">
              <label>Current Showroom Price (Lakhs): ₹{formData.present_price}</label>
              <div className="slider-container">
                <span>₹1L</span>
                <input 
                  type="range" className="slider" name="present_price" 
                  min="0.5" max="50" step="0.1"
                  value={formData.present_price} onChange={handleInputChange} 
                />
                <span>₹50L</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Fuel Type</label>
                <select name="fuel_type" value={formData.fuel_type} onChange={handleInputChange}>
                  <option value={0}>CNG</option>
                  <option value={1}>Diesel</option>
                  <option value={2}>Petrol</option>
                </select>
              </div>
              <div className="form-group">
                <label>Transmission</label>
                <select name="transmission" value={formData.transmission} onChange={handleInputChange}>
                  <option value={0}>Automatic</option>
                  <option value={1}>Manual</option>
                </select>
              </div>
              <div className="form-group">
                <label>Seller Type</label>
                <select name="seller_type" value={formData.seller_type} onChange={handleInputChange}>
                  <option value={0}>Dealer</option>
                  <option value={1}>Individual</option>
                </select>
              </div>
              <div className="form-group">
                <label>Previous Owners</label>
                <select name="owner" value={formData.owner} onChange={handleInputChange}>
                  <option value={0}>First Owner</option>
                  <option value={1}>Second Owner</option>
                  <option value={2}>Third Owner</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label>Upload Car Photo (AI Damage Scan)</label>
              <label className={`uploader ${preview ? 'active' : ''}`}>
                <input type="file" style={{ display: 'none' }} onChange={handleFileChange} accept="image/*" />
                {preview ? (
                  <CheckCircle2 size={40} color="var(--primary)" />
                ) : (
                  <UploadCloud size={40} color="#cbd5e1" />
                )}
                <p>{preview ? 'Image Selected. Click to change.' : 'Drag & Drop or Click to Upload'}</p>
              </label>
            </div>
            
            {error && (
              <div style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <AlertCircle size={20} /> <span>{error}</span>
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <div className="spinner" /> : 'Calculate Final Value'}
            </button>
          </form>
        </section>

        <section className="glass-card result-section">
          <h2 className="card-title">Valuation Results</h2>
          
          {result ? (
            <>
              <div className="price-circle">
                <h3>Final Value</h3>
                <h2>₹{result.data.final_price.toFixed(2)} L</h2>
              </div>
              
              <div className="breakdown">
                <div className="breakdown-row">
                  <span>Base Appraised Price</span>
                  <span>₹{result.data.base_price.toFixed(2)} L</span>
                </div>
                <div className="breakdown-row" style={{ color: result.data.damage_score > 0 ? 'var(--danger)' : 'var(--text-main)' }}>
                  <span>AI Damage Deduction ({(result.data.damage_score * 50).toFixed(1)}%)</span>
                  <span>- ₹{(result.data.base_price - result.data.final_price).toFixed(2)} L</span>
                </div>
                <div className="breakdown-row total">
                  <span>Net PriceDekho Value</span>
                  <span>₹{result.data.final_price.toFixed(2)} L</span>
                </div>
              </div>

              {result.image_base64 && (
                <div style={{ width: '100%', marginTop: '1rem' }}>
                  <p style={{ fontWeight: 600, color: 'var(--text-muted)' }}>AI Vision Analysis:</p>
                  <img 
                    src={`data:image/jpeg;base64,${result.image_base64}`} 
                    alt="AI Annotated Car" 
                    className="annotated-image" 
                  />
                  {result.data.damage_types && result.data.damage_types.length > 0 ? (
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                      {Array.from(new Set(result.data.damage_types)).map(damage => (
                        <span key={damage} style={{ background: 'var(--danger)', color: 'white', padding: '0.3rem 0.8rem', borderRadius: '12px', fontSize: '0.85rem' }}>
                          Detected: {damage}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: 'var(--primary)', marginTop: '0.5rem', fontWeight: 600 }}>No significant body damage detected.</p>
                  )}
                </div>
              )}
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', textAlign: 'center' }}>
              <img src="/logo.png" style={{ width: '100px', opacity: 0.2, marginBottom: '2rem' }} alt="" />
              <p>Upload a vehicle image and submit the specifications to see the detailed PriceDekho AI market valuation.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
