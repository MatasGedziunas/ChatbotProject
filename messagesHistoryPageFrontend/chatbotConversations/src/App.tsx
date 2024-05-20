
import Navigation from "./Navigation/Navigation.tsx"
import Footer from "./Footer/Footer.tsx"
import Home from "./Home/Home.tsx"

function App() {
  return (
    <div className="app-container">
      <Navigation />
      <div className="content-container">
        <main className="main-content">
          {/* Main content goes here */}
          <Home></Home>
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default App;