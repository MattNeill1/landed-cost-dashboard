const items = [
  {id:  1, sku: "Widget-01", description: "Steel Widget", unitCost: 10.0, quantityOnHand: 100},
  {id:  2, sku: "Widget-02", description: "Steel Bolt", unitCost: 5.0, quantityOnHand: 100},
  {id:  3, sku: "Widget-03", description: "Steel Screw", unitCost: 4.0, quantityOnHand: 100},
];

export default function App(){
  return(
    <div callName="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Landed Cost Dashboard</h1>
        <p className="text-gray-5600 mb-6">Inventory items</p>

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
      </div>
    </div>
  );
}