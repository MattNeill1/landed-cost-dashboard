import {useState, useEffect} from "react";
import ItemForm from "./ItemForm";
import ShipmentForm from "./ShipmentForm";
import { API_URL } from "./api";

export default function App(){

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/items`)
     .then((res) => {
      if(!res.ok) throw new Error(`Request Failed: ${res.status}`);
      return res.json();
      })
      .then((data) => setItems(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return(
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 px-6 py-8 shadow-md">
        <div className="mx-auto max-w-[1600px]">
          <h1 className="text-3xl font-bold text-white mb-1">Landed Cost Dashboard</h1>
          <p className="text-blue-100">Inventory items</p>
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="mx-auto max-w-[1600px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <section className="bg-white border-2 border-blue-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-blue-900 mb-3 pb-2 border-b-2 border-blue-700">Items</h2>
              <ItemForm
                items={items}
                setItems={setItems}
                loading={loading}
                error={error}
                setError={setError}
              />
            </section>

            <section className="bg-white border-2 border-blue-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-blue-900 mb-3 pb-2 border-b-2 border-blue-700">Shipments</h2>
              <ShipmentForm items={items}/>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
