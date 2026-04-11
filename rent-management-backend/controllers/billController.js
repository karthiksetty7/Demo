import Bill from "../models/Bill.js";

const generateBillNumber = () => {
  return "BILL-" + Date.now();
};

export const getBills = async (req, res) => {
  try {
    const bills = await Bill.findAll({
      include: [
        { association: "tenant", required: false },
        { association: "building", required: false },
        { association: "floor", required: false },
        { association: "room", required: false },
      ],
      order: [['id', 'DESC']],
    });

    res.json(
      bills.map((b) => ({
        ...b.toJSON(),
        previous: b.previous_reading,
        current: b.current_reading,
      })),
    );
  } catch (err) {
    console.error("GET BILLS ERROR:", err);
    res.status(500).json({
      message: "Error fetching bills",
      error: err.message,
    });
  }
};

export const addBill = async (req, res) => {
  try {
    const bill = await Bill.create({
      bill_number: generateBillNumber(),

      building_id: Number(req.body.building_id),
      floor_id: Number(req.body.floor_id),
      room_id: Number(req.body.room_id),
      tenant_id: Number(req.body.tenant_id),

      previous_reading: Number(req.body.previous_reading),
      current_reading: Number(req.body.current_reading),
      units: Number(req.body.units),

      rate: Number(req.body.rate),
      amount: Number(req.body.amount),

      month: req.body.month,
      year: Number(req.body.year),

      generated_date: new Date(),
    });

    res.json(bill);
  } catch (err) {
    console.log("❌ BILL CREATE ERROR:", err);
    res
      .status(500)
      .json({ message: "Error creating bill", error: err.message });
  }
};

export const updateBill = async (req, res) => {
  try {
    const bill = await Bill.findByPk(req.params.id);

    if (!bill) return res.status(404).json({ message: "Bill not found" });

    await bill.update(req.body);

    res.json(bill);
  } catch (err) {
    res.status(500).json({ message: "Error updating bill" });
  }
};

export const deleteBill = async (req, res) => {
  try {
    const bill = await Bill.findByPk(req.params.id);

    if (!bill) return res.status(404).json({ message: "Bill not found" });

    await bill.destroy();

    res.json({ message: "Bill deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting bill" });
  }
};

export const getLastBill = async (req, res) => {
  try {
    const { tenantId } = req.query;

    const bill = await Bill.findOne({
      where: { tenant_id: tenantId },
      order: [["id", "DESC"]],
    });

    res.json(bill || {});
  } catch (err) {
    res.status(500).json({ message: "Error fetching last bill" });
  }
};
