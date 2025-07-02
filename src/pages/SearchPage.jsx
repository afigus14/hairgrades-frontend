function SearchPage() {
  const fakeResults = [
    { id: 1, name: "Stylist A", rating: 4.9 },
    { id: 2, name: "Stylist B", rating: 4.7 },
  ];

  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold mb-4">Search Results</h2>
      <ul>
        {fakeResults.map((stylist) => (
          <li key={stylist.id} className="border p-4 mb-2 rounded">
            <a href={`/profile/${stylist.id}`} className="text-blue-600 font-medium">
              {stylist.name}
            </a>{" "}
            - Rating: {stylist.rating}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SearchPage;