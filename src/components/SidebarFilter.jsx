import { useState } from "react";
import stylists from "../data/stylists";
import SidebarFilter from "../components/SidebarFilter";
import { Link } from "react-router-dom";

const [genderFilter, setGenderFilter] = useState([]);
const [costRange, setCostRange] = useState([50, 200]);
const [specialtyFilter, setSpecialtyFilter] = useState([]);
const [cityFilter, setCityFilter] = useState("");

function SearchPage() {
  const [filters, setFilters] = useState({
    city: "",
    distance: 50,
    specialty: [],
    gender: [],
    costRange: 500,
  });

const filteredStylists = stylists.filter((stylist) => {
  const matchesGender =
    genderFilter.length === 0 || genderFilter.includes(stylist.gender);

  const matchesCost =
    stylist.cost >= costRange[0] && stylist.cost <= costRange[1];

  const matchesSpecialty =
    specialtyFilter.length === 0 ||
    stylist.specialties.some((spec) => specialtyFilter.includes(spec));

  const matchesCity =
    cityFilter.trim() === "" ||
    stylist.location.toLowerCase().includes(cityFilter.trim().toLowerCase());

  return matchesGender && matchesCost && matchesSpecialty && matchesCity;
});

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#fdfcf7]">
      <div className="md:w-1/4 p-4">
        <SidebarFilter filters={filters} setFilters={setFilters} />
      </div>

      <div className="md:w-3/4 p-4">
        <h1 className="text-2xl font-bold mb-4">Find a Stylist</h1>
        {filteredStylists.length === 0 ? (
          <p className="text-gray-600">No stylists match your criteria.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStylists.map((stylist) => (
              <Link
                key={stylist.id}
                to={`/profile/${stylist.id}`}
                className="bg-white rounded shadow p-4 hover:shadow-lg transition"
              >
                <img
                  src={stylist.photo}
                  alt={stylist.name}
                  className="w-full h-40 object-cover rounded mb-2"
                />
                <h3 className="text-lg font-semibold">{stylist.name}</h3>
                <p className="text-sm text-gray-500">{stylist.location}</p>
                <p className="text-yellow-500 text-sm">
                  ★ {stylist.rating} ({stylist.reviewCount})
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchPage;
