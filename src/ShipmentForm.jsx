import {useState} from "react";

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

          const allocationResponse = await fetch(`http://localhost:8080/api/shipments/${savedRecord.id}/allocation`);
          if (!allocationResponse.ok) {
            throw new Error(`Allocation fetch failed: ${allocationResponse.status}`);
          }

          const allocationData = await allocationResponse.json();
          setAllocations(allocationData);
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
      {/* Temporary: see the state update live as you type */}
      <pre className="mt-3 text-xs">{JSON.stringify(shipment, null, 2)}</pre>
      <pre className="mt-3 text-xs">
        {JSON.stringify({ shipment, lines }, null, 2)}
      </pre>
      <pre className="mt-3 text-xs">{JSON.stringify(allocations, null, 2)}</pre>
    </form>

    );

    
}