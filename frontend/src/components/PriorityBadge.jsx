function PriorityBadge({ complaintType }) {
  const getPriority = () => {
    if (
      complaintType === "Damaged Product" ||
      complaintType === "Wrong Item Delivered"
    ) {
      return {
        label: "High Priority",
        reason: "Needs quick action from support team",
        className: "priority-high"
      };
    }

    if (
      complaintType === "Item Missing" ||
      complaintType === "Late Delivery"
    ) {
      return {
        label: "Medium Priority",
        reason: "Customer is affected, resolution should be tracked",
        className: "priority-medium"
      };
    }

    return {
      label: "Low Priority",
      reason: "Can be resolved with standard support flow",
      className: "priority-low"
    };
  };

  if (!complaintType) return null;

  const priority = getPriority();

  return (
    <div className={`priority-badge ${priority.className}`}>
      <div>
        <strong>{priority.label}</strong>
        <p>{priority.reason}</p>
      </div>
    </div>
  );
}

export default PriorityBadge;