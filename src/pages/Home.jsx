import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div style={{ fontFamily: 'Segoe UI, sans-serif' }}>
      {/* Hero Section */}
      {/* Hero Section */}
<section
  style={{
    background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
    color: '#fff',
    padding: '60px 20px',
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '40px',
  }}
>
  <div style={{ maxWidth: '500px', textAlign: 'left' }}>
    <h1 style={{ fontSize: '50px', marginBottom: '20px', fontWeight: '700' }}>
      Ada21tech Exam-Center 
    </h1>
    <h1 style={{ fontSize: '45px', marginBottom: '20px', fontWeight: '700' }}>
      Practical Learning for Students
    </h1>
    <p style={{ fontSize: '24px', marginBottom: '30px', opacity: '0.95' }}>
      Master Your Grades 6–12 Exams with Ada21Tech
    </p>
    <Link to="/register">
      <button
        style={{
          background: '#ff6b6b',
          color: '#fff',
          border: 'none',
          padding: '15px 40px',
          fontSize: '18px',
          fontWeight: 'bold',
          borderRadius: '50px',
          cursor: 'pointer',
          boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={(e) => (e.target.style.transform = 'scale(1.05)')}
        onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
      >
        Get Started NOW!
      </button>
    </Link>
  </div>
  <div>
    <img
      src="https://cdn.pixplet.com/wp-content/uploads/2025/03/Futuristic-Classroom-with-Students-Using-Laptops.jpg"
      alt="Student studying with pen and book"
      style={{
        maxWidth: '400px',
        width: '100%',
        borderRadius: '20px',
        boxShadow: '0 20px 30px rgba(0,0,0,0.3)',
      }}
    />
  </div>
</section>

      {/* Features Section */}
      <section style={{ padding: '60px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '36px', marginBottom: '50px', color: '#1e3c72' }}>
          Why Choose Ada21Tech?
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '30px' }}>
          {[
            {
              icon: '📚',
              title: 'Grade‑Specific Content',
              desc: 'Questions tailored exactly to your grade (6–12). No more guessing what to study.',
            },
            {
              icon: '⏱️',
              title: 'Timed Quizzes',
              desc: 'Simulate real exam conditions with adjustable timers. Build speed and accuracy.',
            },
            {
              icon: '🎓',
              title: 'Free Trial Access',
              desc: 'Try sample questions instantly and See the quality yourself.',
            },
            {
              icon: '📊',
              title: 'Detailed Explanations',
              desc: 'Understand every answer with clear, step‑by‑step explanations.',
            },
            {
              icon: '🔒',
              title: 'Simple & Secure',
              desc: 'No email needed. Just pick a username, password, and grade.',
            },
            {
              icon: '📱',
              title: 'Works on Any Device',
              desc: 'Desktop, tablet, or phone—study wherever you are.',
            },
          ].map((feat, idx) => (
            <div
              key={idx}
              style={{
                background: '#f8faff',
                borderRadius: '16px',
                padding: '30px 20px',
                width: '300px',
                textAlign: 'center',
                boxShadow: '0 6px 18px rgba(0,0,0,0.05)',
                border: '1px solid #e0e7ff',
              }}
            >
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>{feat.icon}</div>
              <h3 style={{ color: '#1e3c72', marginBottom: '10px' }}>{feat.title}</h3>
              <p style={{ color: '#4a5568', lineHeight: '1.6' }}>{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section
        style={{
          background: '#f0f4ff',
          padding: '60px 20px',
        }}
      >
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '36px', marginBottom: '50px', color: '#1e3c72' }}>
            How It Works
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '40px' }}>
            {[
              { step: '1', text: 'Register in seconds with just a username and grade.' },
              { step: '2', text: 'Try free sample questions instantly.' },
              { step: '3', text: 'Practice, track progress, and ace your exams!' },
              { step: '4', text: 'Review all quizzes you attempted and learn from your mistakes.' },
            ].map((item) => (
              <div key={item.step} style={{ display: 'flex', alignItems: 'center', gap: '20px', maxWidth: '400px' }}>
                <div
                  style={{
                    background: '#2a5298',
                    color: '#fff',
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    fontWeight: 'bold',
                  }}
                >
                  {item.step}
                </div>
                <p style={{ fontSize: '18px', color: '#2d3748', margin: 0 }}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section style={{ padding: '60px 20px', textAlign: 'center', background: '#fff' }}>
        <h2 style={{ fontSize: '32px', color: '#1e3c72', marginBottom: '20px' }}>
          Ready to Boost Your Grades?
        </h2>
        <p style={{ fontSize: '18px', color: '#4a5568', marginBottom: '30px' }}>
          Join thousands of Ethiopian students mastering their exams with Ada21Tech.
        </p>
        <Link to="/register">
          <button
            style={{
              background: '#1e3c72',
              color: '#fff',
              border: 'none',
              padding: '15px 40px',
              fontSize: '18px',
              fontWeight: 'bold',
              borderRadius: '50px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          >
            Start Learning Now
          </button>
        </Link>
      </section>

      {/* Footer */}
      <footer
        style={{
          background: '#1a202c',
          color: '#cbd5e0',
          padding: '30px 20px',
          textAlign: 'center',
        }}
      >
        <p>© 2026 Ada21Tech — Practical Learning for Ethiopian Students</p>
        <p style={{ marginTop: '10px', fontSize: '14px' }}>
          Contact: support@ada21tech.com |  0936592186 (Adane F)
        </p>
      </footer>
    </div>
  );
};

export default Home;