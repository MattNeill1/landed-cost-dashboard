import {useState, useEffect, Fragment} from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { API_URL } from "./api";

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

    const [createdShipmentNumber, setCreatedShipmentNumber] = useState(null);
    const [error, setError] = useState(null);
    const [allocations, setAllocations] = useState([]);
    const [loading, setLoading] = useState(true);

    const [shipments, setShipments] = useState([]);

    const [selectedShipmentId, setSelectedShipmentId] = useState(null);

    const [selectedAllocationMethod, setSelectedAllocationMethod] = useState(null);

    const [expandedShipmentIds, setExpandedShipmentIds] = useState(new Set());


    
    useEffect(() => {
        fetch(`${API_URL}/api/shipments`)
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

    function handleExistingShipmentChange(id, e){
        const {name, value} = e.target;
        setShipments((prev) => 
            prev.map((shipment, i) =>
                shipment.id === id ? {...shipment, [name]: e.target.value} : shipment
            )
        );
    }

    async function viewAllocations(shipmentId, allocationMethod){
        setError(null);
        setSelectedShipmentId(shipmentId);
        setSelectedAllocationMethod(allocationMethod);
        try {
            const response = await fetch(`${API_URL}/api/shipments/${shipmentId}/allocation?method=${allocationMethod}`);
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
          const response = await fetch(`${API_URL}/api/shipments`, {
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
          setCreatedShipmentNumber(savedRecord.shipmentNumber);
          setShipments((prev) => [...prev, savedRecord]);
        }catch (err) {
          setError(err.message);
        }

    }

    function toggleExpand(shipmentId){
        setExpandedShipmentIds((prev) => {
            const next = new Set(prev);
            if (next.has(shipmentId)) {
                next.delete(shipmentId);
            } else {
                next.add(shipmentId);
            }
            return next;
        });
    }


    function addLine(){
        setLines((prev) => [...prev, {itemId: "", quantity: "", weight: ""}]);
    }

    function removeLine(index){
        setLines((prev) => prev.filter((_, i) => i !== index));
    }

    return (
    <div>
      <form className="bg-blue-50 p-6 rounded-lg shadow border border-blue-100" onSubmit={handleSubmit}>
      <h2 className="text-lg font-bold mb-4 text-gray-900">New Shipment</h2>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="shipmentNumber">
          Shipment Number
        </label>
        <input
          className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline w-full"
          id="shipmentNumber"
          name="shipmentNumber"
          placeholder="Shipment number"
          value={shipment.shipmentNumber}
          onChange={handleChange}
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="freightCost">
          Freight Cost
        </label>
        <input
          className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline w-full"
          id="freightCost"
          name="freightCost"
          placeholder="Freight cost"
          value={shipment.freightCost}
          onChange={handleChange}
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dutyCost">
          Duty Cost
        </label>
        <input
          className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline w-full"
          id="dutyCost"
          name="dutyCost"
          placeholder="Duty cost"
          value={shipment.dutyCost}
          onChange={handleChange}
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="insuranceCost">
          Insurance Cost
        </label>
        <input
          className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline w-full"
          id="insuranceCost"
          name="insuranceCost"
          placeholder="Insurance cost"
          value={shipment.insuranceCost}
          onChange={handleChange}
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="allocationMethod">
          Allocation Method
        </label>
        <select
          className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline w-full"
          id="allocationMethod"
          name="allocationMethod"
          value={shipment.allocationMethod}
          onChange={handleChange}
        >
          <option value="VALUE">VALUE</option>
          <option value="WEIGHT">WEIGHT</option>
          <option value="QUANTITY">QUANTITY</option>
        </select>
      </div>

      <h3 className="text-gray-700 text-sm font-bold mb-2 mt-2">Lines</h3>
      {lines.map((line, index) => (
        <div key={index} className="flex flex-wrap gap-2 mb-3 items-center bg-gray-50 p-3 rounded">
          <select
            className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline flex-1 min-w-0"
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
            className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline w-24"
            name="quantity"
            placeholder="Quantity"
            value={line.quantity}
            onChange={(e) => handleLineChange(index, e)}
          />
          <input
            className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline w-24"
            name="weight"
            placeholder="Weight"
            value={line.weight}
            onChange={(e) => handleLineChange(index, e)}
          />
          <button
            className="text-red-500 hover:text-red-700 text-sm font-bold py-2 px-3 shrink-0"
            type="button"
            onClick={() => removeLine(index)}
          >
            Remove
          </button>
        </div>

        ))}
        <button
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded mt-1"
          type="button"
          onClick={addLine}
        >
          Add Line
        </button>
        <div className="mt-4">
          <button
            className="bg-blue-700 hover:bg-blue-900 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Create Shipment
          </button>
        </div>

        {error && <p className="text-red-600 mt-2">{error}</p>}
        {createdShipmentNumber && <p className="text-green-600 mt-2">Shipment created: {createdShipmentNumber}</p>}

      </form>

    <div className="mt-6">
    {loading && <p className="text-gray-600">Loading...</p>}
    {error && <p className="text-red-500">Error: {error}</p>}

    {!loading && !error && shipments.length === 0 && (
          <p className="text-gray-600">No Shipments to display</p>
        )}

        {!loading && !error && shipments.length > 0 && (

        <div className="overflow-x-auto rounded-lg shadow border border-blue-100">
        <table className="w-full bg-white overflow-hidden">
          <thead className="bg-blue-100 text-left text-sm text-blue-900">
            <tr>
              <th className="px-4 py-3">Shipment Number</th>
              <th className="px-4 py-3">Freight Cost</th>
              <th className="px-4 py-3 text-right">Duty Cost</th>
              <th className="px-4 py-3 text-right">Insurance Cost</th>
              <th className="px-4 py-3 text-right">Allocation Method</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody className="text-sm text-gray-800">
            {shipments.map((existingShipment)=>(
            <Fragment key={existingShipment.id}>
              <tr className="border-t border-gray-100">
                <td className="px-4 py-3 font-medium">{existingShipment.shipmentNumber}</td>
                <td className="px-4 py-3">{existingShipment.freightCost}</td>
                <td className="px-4 py-3 text-right">{existingShipment.dutyCost}</td>
                <td className="px-4 py-3 text-right">{existingShipment.insuranceCost}</td>
                <td className="px-4 py-3 text-right">
                  <select
                    className="border rounded py-1 px-2 text-sm text-gray-700 focus:outline-none focus:shadow-outline"
                    name="allocationMethod"
                    value={existingShipment.allocationMethod}
                    onChange={(e) => handleExistingShipmentChange(existingShipment.id, e)}
                  >
                    <option value="VALUE">VALUE</option>
                    <option value="WEIGHT">WEIGHT</option>
                    <option value="QUANTITY">QUANTITY</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 justify-center">
                    <button
                      type="button"
                      onClick={() => viewAllocations(existingShipment.id, existingShipment.allocationMethod)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-700 text-blue-800 hover:bg-blue-50"
                    >
                      View Allocations
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleExpand(existingShipment.id)}
                      className={
                        expandedShipmentIds.has(existingShipment.id)
                          ? "text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-400 text-gray-800 bg-gray-100"
                          : "text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }
                    >
                      {expandedShipmentIds.has(existingShipment.id) ? "Hide Lines" : "Show Lines"}
                    </button>
                  </div>
                </td>
              </tr>
              {expandedShipmentIds.has(existingShipment.id) && (
                <tr className="bg-gray-50">
                  <td colSpan="6" className="px-4 py-3">
                    <table className="w-full text-sm text-gray-800">
                      <thead>
                        <tr>
                          <th className="px-2 py-1">Item</th>
                          <th className="px-2 py-1 text-right">Quantity</th>
                          <th className="px-2 py-1 text-right">Weight</th>
                        </tr>
                      </thead>
                      <tbody>
                        {existingShipment.shipmentLines.map((line) => (
                          <tr key={line.id} className="border-t border-gray-100">
                            <td className="px-2 py-1">{line.item.sku} - {line.item.description}</td>
                            <td className="px-2 py-1 text-right">{line.quantity}</td>
                            <td className="px-2 py-1 text-right">{line.weight}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </td>
                </tr>
              )}
            </Fragment>
            ))}
          </tbody>

        </table>
        </div>
        )}
    </div>

        {selectedShipmentId && (
          <h3 className="text-lg font-semibold mt-6 mb-3 text-gray-900">
            Allocation for shipment {selectedShipmentId} ({selectedAllocationMethod})
          </h3>
        )}

        {allocations.length > 0 && (
          <>
          <div className="overflow-x-auto rounded-lg shadow border border-blue-100">
          <table className="w-full bg-white overflow-hidden">
            <thead className="bg-blue-100 text-left text-sm text-blue-900">
              <tr>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3 text-right">Allocated Cost</th>
                <th className="px-4 py-3 text-right">Landed Unit Cost</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-800">
              {allocations.map((allocation, index) => (
                <tr key={index} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-medium">{allocation.itemSku}</td>
                  <td className="px-4 py-3 text-right">{allocation.allocatedCost}</td>
                  <td className="px-4 py-3 text-right">{allocation.landedUnitCost}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          <div className="bg-white rounded-lg shadow p-4 mt-4 border border-blue-100">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={allocations} margin={{ top: 5, right: 30, left: 5, bottom: 5 }} >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="itemSku" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="allocatedCost" fill="#1d4ed8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          </>
        )}
    </div>

    );

    
}