export default function Pricing() {
  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Pricing Plans</h1>
      <p>Choose the right plan for your business growth.</p>
      
      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        <div style={{ border: '1px solid #ccc', padding: '20px', flex: 1 }}>
          <h2>Starter</h2>
          <p>$49/month</p>
          <ul>
            <li>Automated Lead Capture</li>
            <li>Basic Analytics</li>
            <li>Email Support</li>
          </ul>
        </div>
        
        <div style={{ border: '1px solid #0070f3', padding: '20px', flex: 1 }}>
          <h2>Pro</h2>
          <p>$99/month</p>
          <ul>
            <li>Advanced AI Lead Scoring</li>
            <li>CRM Integration</li>
            <li>Priority 24/7 Support</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
