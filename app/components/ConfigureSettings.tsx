import Image from 'next/image';

export function ConfigureSettings() {
  return (
    <div>
      <div className="flex items-center gap-4 mb-8 px-16 py-8">
        <div className="w-16 h-16 rounded-full overflow-hidden">
          <Image src="/images/image.png" alt="Avatar" width={56} height={56} />
        </div>
        <div>
          <h1 className="text-2xl font-bold ">Your Workspace</h1>
          <div className="flex gap-2 py-2">
            <span className="px-3 py-1 bg-gray-100 rounded-md text-sm">Configurable</span>
            <span className="px-3 py-1 bg-gray-100 rounded-md text-sm">Dynamic</span>
          </div>
          <p className="text-gray-800">Add, activate or deactivate assistants as needed</p>
        </div>
      </div>

      <div className="bg-[#8B1F2F] text-white p-8 rounded-2xl">
        <h2 className="text-3xl font-semibold text-center mb-2">Configure Assistant Settings</h2>
        <p className="text-center mb-12">Customize assistant features</p>
        
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-8 mb-8">
            <div className="flex-1">
              <label className="block mb-4">Assistant Name</label>
              <input 
                type="text" 
                placeholder="Enter Name"
                className="w-full p-3 rounded-lg bg-[#FFF8DC] text-black"
              />
            </div>
            
            <div className="flex-1">
              <label className="block mb-4">Settings</label>
              <div className="flex gap-4">
                <button className="flex-1 bg-[#F4A460] text-white py-3 rounded-lg">
                  Activate
                </button>
                <button className="flex-1 bg-[#8B1F2F] text-white py-3 rounded-lg border border-white">
                  Deactivate
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <button className="w-1/3 bg-[#1A1A1A] text-white py-3 rounded-lg">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 