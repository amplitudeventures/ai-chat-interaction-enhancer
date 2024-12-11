export function Footer() {
    return (
      <footer>
        {/* Banner Section */}
        <div className="relative h-64 mb-0">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('/images/hand-robot.jpg')",
              filter: "brightness(0.9)"
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <h2 className="text-2xl font-serif text-black">
              Enhance your workflow with smart assistants!
            </h2>
          </div>
        </div>
  
        {/* Footer Section */}
        <div className="bg-[#008080] text-white p-12">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
            <div>
              <p>© 2024 AI Assistants Inc. All rights reserved</p>
            </div>
            <div className="flex gap-8 mt-4 md:mt-0">
              <a href="#" className="hover:opacity-80">Privacy Policy</a>
              <a href="#" className="hover:opacity-80">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    );
  }