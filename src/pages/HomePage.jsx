function HomePage() {
  return (
    <div className="p-8 text-center">
      <h1 className="text-4xl font-bold mb-4">Welcome to Hairgrades</h1>
      <p className="text-lg mb-6">Find a stylist that will make you feel good about your hair.</p>
      <input
        type="text"
        placeholder="Search by city, style, or name"
        className="border p-2 rounded w-full max-w-md"
      />
    </div>
  );
}

export default HomePage;