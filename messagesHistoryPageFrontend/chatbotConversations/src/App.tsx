
import Navigation from "./Navigation/Navigation.tsx"
import Footer from "./Footer/Footer.tsx"

function App() {
  return (
    <div className="app-container">
      <Navigation />
      <div className="content-container">
        <main className="main-content">
          {/* Main content goes here */}
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default App;