import {useState, useEffect} from "react";

export default function ShipmentForm({ items = [] }) {
    const [shipment, setShipment] = useState({
    shipmentNumber: "",
    freightCost: "",
    dutyCost: "",
    insuranceCost: "",
    allocationMethod: "VALUE", 
    })
    const [lines, setLines] = useState([
        {itemId: "", quantity: "", weight: ""},
    ]);

    const [shipmentId, setShipmentId] = useState(null);
    const [error, setError] = useState(null);
    const [allocations, setAllocations] = useState([]);
    const [loading, setLoading] = useState(true);

    const [shipments, setShipments] = useState([]);

    const [selectedShipmentId, setSelectedShipmentId] = useState(null);
    
    useEffect(() => {
        fetch("http://localhost:8080/api/shipments")
        .then((res) => {
            if(!res.ok) throw new Error(`Request Failed: ${res.status}`);
            return res.json();
        })
        .then((data) => setShipments(data))
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }, []);

    function handleChange(e){
        const {name, value} = e.target;
        setShipment((prev) => ({
            ...prev,
            [name]: value
        }));    

    }
    function handleLineChange(index, e){
        const {name, value} = e.target;
        setLines((prev) => 
            prev.map((line, i) =>
                i === index ? {...line, [name]: e.target.value} : line
            )
        );
    }

    async function viewAllocations(shipmentId){
        setError(null);
        setSelectedShipmentId(shipmentId);
        try {
            const response = await fetch(`http://localhost:8080/api/shipments/${shipmentId}/allocation`);
            if (!response.ok) {
              const body = await response.json().catch(() => ({}));
                throw new Error(body.error || `Allocation fetch failed: ${response.status}`);
            }
            const allocationData = await response.json();
            setAllocations(allocationData);
        } catch (err) {
            setError(err.message);
        }
    }
    async function handleSubmit(e){
        e.preventDefault();
        setError(null);

        const payload = {
          shipmentNumber: shipment.shipmentNumber,
          freightCost: Number(shipment.freightCost),
          dutyCost: Number(shipment.dutyCost),
          insuranceCost: Number(shipment.insuranceCost),
          allocationMethod: shipment.allocationMethod,
          shipmentLines: lines.map((line) => ({
            item: {id: line.itemId},
            quantity: Number(line.quantity),
            weight: Number(line.weight),
          })),
        };
        console.log(JSON.stringify(payload, null, 2));
        try {
          const response = await fetch("http://localhost:8080/api/shipments", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            throw new Error(`Post failed: ${response.status}`);
          }

          const savedRecord = await response.json();
          setShipmentId(savedRecord.id);
          setShipments((prev) => [...prev, savedRecord]);
        }catch (err) {
          setError(err.message);
        }

    }


    function addLine(){
        setLines((prev) => [...prev, {itemId: "", quantity: "", weight: ""}]);
    }

    function removeLine(index){
        setLines((prev) => prev.filter((_, i) => i !== index));
    }

    return (
    <div>

    {loading && <p>Loading...</p>}
    {error && <p className="text-red-500">Error: {error}</p>}
    
    {!loading && !error && shipments.length === 0 && (
          <p>No Shipments to display</p>
        )}

        {!loading && !error && shipments.length > 0 && (

        <table className="w-full bg-white rounded-lg shadow overflow-hidden">
          <thead className="bg-gray-100 text-left text-sm text-gray-600">
            <tr>
              <th className="px-4 py-3">Shipment Number</th>
              <th className="px-4 py-3">Freight Cost</th>
              <th className="px-4 py-3 text-right">Duty Cost</th>
              <th className="px-4 py-3 text-right">Insurance Cost</th>
              <th className="px-4 py-3 text-right">Allocation Method</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="text-sm text-gray-800">
            {shipments.map((shipment)=>(
              <tr key={shipment.id} className="border-t border-gray-100">
                <td className="px-4 py-3 font-medium">{shipment.shipmentNumber}</td>
                <td className="px-4 py-3">{shipment.freightCost}</td>
                <td className="px-4 py-3 text-right">{shipment.dutyCost}</td>
                <td className="px-4 py-3 text-right">{shipment.insuranceCost}</td>
                <td className="px-4 py-3 text-right">{shipment.allocationMethod}</td>
                <td className="px-4 py-3 text-right"> 
                  <button
                    type="button"
                    onClick={() => viewAllocations(shipment.id)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    View Allocations
                  </button>
                </td>
              </tr>

            ))}
          </tbody>

        </table>
        )}
    

    <form className="p-4 border rounded" onSubmit={handleSubmit}>
      <h2 className="text-lg font-bold mb-3">New Shipment</h2>

      <input
        name="shipmentNumber"
        placeholder="Shipment number"
        value={shipment.shipmentNumber}
        onChange={handleChange}
      />
      <input
        name="freightCost"
        placeholder="Freight cost"
        value={shipment.freightCost}
        onChange={handleChange}
      />
      <input
        name="dutyCost"
        placeholder="Duty cost"
        value={shipment.dutyCost}
        onChange={handleChange}
      />
      <input
        name="insuranceCost"
        placeholder="Insurance cost"
        value={shipment.insuranceCost}
        onChange={handleChange}
      />

      <select
        name="allocationMethod"
        value={shipment.allocationMethod}
        onChange={handleChange}
      >
        <option value="VALUE">VALUE</option>
        <option value="WEIGHT">WEIGHT</option>
        <option value="QUANTITY">QUANTITY</option>
      </select>

      <h3 className="font-semibold mt-4 mb-2">Lines</h3>
      {lines.map((line, index) => (
        <div key={index} className="flex gap-2 mb-2">
          <select
            name="itemId"
            placeholder="Item ID"
            value={line.itemId}
            onChange={(e) => handleLineChange(index, e)}
          >
            <option value="">Select Item</option>
            {
                items.map((item) => (
                    <option key={item.id} value={item.id}>
                        {item.sku} - {item.description}
                    </option>
                ))
            }
          </select>
          <input
            name="quantity"
            placeholder="Quantity"
            value={line.quantity}
            onChange={(e) => handleLineChange(index, e)}
          />
          <input
            name="weight"
            placeholder="Weight"
            value={line.weight}
            onChange={(e) => handleLineChange(index, e)}
          />
          <button type="button" onClick={() => removeLine(index)}>
            Remove
          </button>
        </div>

        ))}
        <button type="button" onClick={addLine}>Add Line</button>
        <div className="mt-4">
          <button type="submit">Create Shipment</button>
        </div>
        {error && <p className="text-red-600 mt-2">{error}</p>}
        {shipmentId && <p className="text-green-600 mt-2">Shipment created with ID: {shipmentId}</p>}
        {selectedShipmentId && <h3 className="font-semibold mt-4">Allocation for shipment {selectedShipmentId}</h3>}

        {allocations.length > 0 && (
          
          <table className="mt-4 w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-4 py-2">Item</th>
                <th className="border px-4 py-2">Allocated Cost</th>
                <th className="border px-4 py-2">Landed Unit Cost</th>
                
              </tr>
            </thead>
            <tbody>
              {allocations.map((allocation, index) => (
                <tr key={index}>
                  <td className="border px-4 py-2">{allocation.itemSku}</td>
                  <td className="border px-4 py-2">{allocation.allocatedCost}</td>
                  <td className="border px-4 py-2">{allocation.landedUnitCost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
     
    </form>
    </div>

    );

    
}