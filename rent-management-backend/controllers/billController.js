import Bill from "../models/Bill.js";
import Tenant from "../models/Tenant.js";
import Building from "../models/Building.js";
import Floor from "../models/Floor.js";
import Room from "../models/Room.js";

const generateBillNumber = () => {
  return "BILL-" + Date.now();
};

/* ================= GET ALL ================= */
export const getBills = async (req, res) => {
  try {
    const bills = await Bill.findAll({
      include: [
        {
          model: Tenant,
          as: "tenant",
          attributes: ["id", "name"],
          include: [
            {
              model: Building,
              as: "building",
              attributes: ["id", "name"],
            },
            {
              model: Room,
              as: "room",
              attributes: ["id", "room_number"],
            },
            {
              model: Floor,
              as: "floor",
              attributes: ["id", "floor_number"],
            },
          ],
        },
      ],
      order: [["id", "DESC"]],
    });

    // ✅ NO manual mapping → send clean nested data
    res.json({
      success: true,
      data: bills,
    });

  } catch (err) {
    console.error("GET BILLS ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Error fetching bills",
      error: err.message,
    });
  }
};

/* ================= CREATE ================= */
export const addBill = async (req, res) => {
  try {
    const data = normalize(req.body);

    // ✅ CHECK DUPLICATE BILL (IMPORTANT)
    const existingBill = await Bill.findOne({
      where: {
        tenant_id: data.tenant_id,
        month: data.month,
        year: data.year,
      },
    });

    if (existingBill) {
      return res.status(400).json({
        success: false,
        message: "Bill already exists for this tenant, month, and year",
      });
    }

    const bill = await Bill.create({
      ...data,
      bill_number: generateBillNumber(),
      generated_date: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "Bill created successfully",
      data: bill,
    });

  } catch (err) {
    console.error("CREATE BILL ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to create bill",
      error: err.message,
    });
  }
};

/* ================= UPDATE ================= */
export const updateBill = async (req, res) => {
  try {
    const { id } = req.params;

    const bill = await Bill.findByPk(id);

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found",
      });
    }

    const data = normalize(req.body);

    // ✅ PREVENT DUPLICATE ON UPDATE
    const existingBill = await Bill.findOne({
      where: {
        tenant_id: data.tenant_id,
        month: data.month,
        year: data.year,
      },
    });

    if (existingBill && existingBill.id !== Number(id)) {
      return res.status(400).json({
        success: false,
        message: "Another bill already exists for this month",
      });
    }

    await bill.update(data);

    return res.json({
      success: true,
      message: "Bill updated successfully",
      data: bill,
    });

  } catch (err) {
    console.error("UPDATE BILL ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to update bill",
      error: err.message,
    });
  }
};

/* ================= DELETE ================= */
export const deleteBill = async (req, res) => {
  try {
    const bill = await Bill.findByPk(req.params.id);

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found",
      });
    }

    await bill.destroy();

    return res.json({
      success: true,
      message: "Bill deleted successfully",
    });

  } catch (err) {
    console.error("DELETE BILL ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to delete bill",
      error: err.message,
    });
  }
};

/* ================= LAST BILL ================= */
export const getLastBill = async (req, res) => {
  try {
    const { tenantId } = req.query;

    const bill = await Bill.findOne({
      where: { tenant_id: tenantId },
      order: [["id", "DESC"]],
    });

    return res.json({
      success: true,
      data: bill || {},
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch last bill",
    });
  }
};

/* ================= NORMALIZER ================= */
const normalize = (body) => ({
  tenant_id: Number(body.tenant_id),

  previous_reading: Number(body.previous_reading),
  current_reading: Number(body.current_reading),
  units: Number(body.units),

  rate: Number(body.rate),
  amount: Number(body.amount),

  month: body.month,
  year: Number(body.year),
});
