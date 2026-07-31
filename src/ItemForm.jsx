import {useState} from "react";
import { API_URL } from "./api";
import LoadingNotice from "./LoadingNotice";

const emptyForm = { sku: "", description: "", unitCost: "", quantityOnHand: "" };

export default function ItemForm({ items, setItems, loading, error, setError }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  function handleChange(e){
    const {name, value} = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  }

  function handleSubmit(e){
    e.preventDefault();
    fetch(`${API_URL}/api/items`, {
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
      .catch((err) => setError(err.message));
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="bg-blue-50 p-6 rounded-lg shadow border border-blue-100">
        <h2 className="text-lg font-bold mb-4 text-gray-900">New Item</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="sku">
              SKU
            </label>
            <input
              className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline w-full"
              id="sku"
              name="sku"
              type="text"
              placeholder="Enter SKU"
              value={form.sku}
              onChange={handleChange}
            />
            {errors.sku && <p className="text-red-600 text-sm mt-1">{errors.sku}</p>}
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
              Description
            </label>
            <input
              className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline w-full"
              id="description"
              name="description"
              type="text"
              placeholder="Enter description"
              value={form.description}
              onChange={handleChange}
            />
            {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="unitCost">
              Unit Cost
            </label>
            <input
              className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline w-full"
              id="unitCost"
              name="unitCost"
              type="number"
              placeholder="Enter unit cost"
              value={form.unitCost}
              onChange={handleChange}
            />
            {errors.unitCost && <p className="text-red-600 text-sm mt-1">{errors.unitCost}</p>}
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="quantityOnHand">
              On Hand
            </label>
            <input
              className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline w-full"
              id="quantityOnHand"
              name="quantityOnHand"
              type="number"
              placeholder="Enter quantity on hand"
              value={form.quantityOnHand}
              onChange={handleChange}
            />
            {errors.quantityOnHand && <p className="text-red-600 text-sm mt-1">{errors.quantityOnHand}</p>}
          </div>
        </div>
        <button
          className="bg-blue-700 hover:bg-blue-900 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          type="submit"
        >
          Submit
        </button>
      </form>

      <div className="mt-6">
        {loading && <LoadingNotice explain />}
        {error && <p className="text-red-500">Error: {error}</p>}

        {!loading && !error && items.length === 0 && (
          <p className="text-gray-600">No items to display</p>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="overflow-x-auto rounded-lg shadow border border-blue-100">
          <table className="w-full bg-white overflow-hidden">
            <thead className="bg-blue-100 text-left text-sm text-blue-900">
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
          </div>
        )}
      </div>
    </>
  );
}
