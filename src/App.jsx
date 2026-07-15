import {useState, useEffect} from "react";

const emptyForm = { sku: "", description: "", unitCost: "", quantityOnHand: "" };

export default function App(){

  const [form, setForm] = useState(emptyForm);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetch("http://localhost:8080/api/items")
     .then((res) => {
      if(!res.ok) throw new Error('Request Failed: ${res.status}');
      return res.json();
      })
      .then((data) => setItems(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false)); 
  }, []);

  function handleChange(e){
    const {name, value} = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));

  }

  function handleSubmit(e){
    e.preventDefault();
    // Handle form submission logic here
    fetch("http://localhost:8080/api/items", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
          sku: form.sku,
          description: form.description,
          unitCost: parseFloat(form.unitCost),
          quantityOnHand: parseInt(form.quantityOnHand)
        }),
      })
      .then((res) => {
        if(res.status === 400) {
          return res.json().then((fieldErrors)=> setErrors(fieldErrors));
        }
        if(!res.ok) throw new Error(`Request Failed: ${res.status}`);
        return res.json().then((data) => {
          setItems((prev) => [...prev, data]);
          setForm(emptyForm);
        });
      })
      
      .catch((err) => setError(err.message))
    }
  

  

  return(
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Landed Cost Dashboard</h1>
        <p className="text-gray-5600 mb-6">Inventory items</p>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="sku">
              SKU
            </label>
            <input
              className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="sku"
              name="sku"
              type="text"
              placeholder="Enter SKU"
              value={form.sku}
              onChange={handleChange}
            />
            {errors.sku && <p className="text-red-600 text-sm mt-1">{errors.sku}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
              Description
            </label>
            <input
              className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="description"
              name="description"
              type="text"
              placeholder="Enter description"
              value={form.description}
              onChange={handleChange}
            />
            {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="unitCost">
              Unit Cost
            </label>
            <input
              className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="unitCost"
              name="unitCost"
              type="number"
              placeholder="Enter unit cost"
              value={form.unitCost}
              onChange={handleChange}
            />
            {errors.unitCost && <p className="text-red-600 text-sm mt-1">{errors.unitCost}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="quantityOnHand">
              On Hand
            </label>
            <input
              className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="quantityOnHand"
              name="quantityOnHand"
              type="number"
              placeholder="Enter quantity on hand"
              value={form.quantityOnHand}
              onChange={handleChange}
            />
            {errors.quantityOnHand && <p className="text-red-600 text-sm mt-1">{errors.quantityOnHand}</p>}
          </div>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Submit
          </button>
        </form>


        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
        

        {!loading && !error && items.length === 0 && (
          <p>No items to display</p>
        )}

        {!loading && !error && items.length > 0 && (

        <table className="w-full bg-white rounded-lg shadow overflow-hidden">
          <thead className="bg-gray-100 text-left text-sm text-gray-600">
            <tr>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3 text-right">Unit Cost</th>
              <th className="px-4 py-3 text-right">On Hand</th>
            </tr>
          </thead>

          <tbody className="text-sm text-gray-800">
            {items.map((item)=>(
              <tr key={item.id} className="border-t border-gray-100">
                <td className="px-4 py-3 font-medium">{item.sku}</td>
                <td className="px-4 py-3">{item.description}</td>
                <td className="px-4 py-3 text-right">{item.unitCost}</td>
                <td className="px-4 py-3 text-right">{item.quantityOnHand}</td>
              </tr>

            ))}
          </tbody>

        </table>
        )}
      </div>
    </div>
  );
}