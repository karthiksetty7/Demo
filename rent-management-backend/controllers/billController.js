import Bill from "../models/Bill.js";
import Tenant from "../models/Tenant.js";
import Room from "../models/Room.js";
import Floor from "../models/Floor.js";
import Building from "../models/Building.js";

/* ================= BILL NUMBER ================= */
const generateBillNumber = () => {
  return "BILL-" + Date.now();
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

/* ================= GET ALL BILLS ================= */
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
              model: Room,
              as: "room",
              attributes: ["room_number", "building_id", "floor_id"],
            },
            {
              model: Floor,
              as: "floor",
              attributes: ["floor_number"],
            },
            {
              model: Building,
              as: "building",
              attributes: ["name"],
            },
          ],
        },
      ],
      order: [["id", "DESC"]],
    });

    return res.json({
      success: true,
      data: bills || [],
    });
  } catch (err) {
    console.error("❌ GET BILLS ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch bills",
      error: err.message,
    });
  }
};

/* ================= CREATE BILL ================= */
export const addBill = async (req, res) => {
  try {
    const data = normalize(req.body);

    const existing = await Bill.findOne({
      where: {
        tenant_id: data.tenant_id,
        month: data.month,
        year: data.year,
      },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Bill already exists for this tenant, month and year",
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
    console.error("❌ CREATE BILL ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to create bill",
      error: err.message,
    });
  }
};

/* ================= UPDATE BILL ================= */
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

    const duplicate = await Bill.findOne({
      where: {
        tenant_id: data.tenant_id,
        month: data.month,
        year: data.year,
      },
    });

    if (duplicate && Number(duplicate.id) !== Number(id)) {
      return res.status(400).json({
        success: false,
        message: "Another bill already exists for this tenant/month/year",
      });
    }

    await bill.update(data);

    return res.json({
      success: true,
      message: "Bill updated successfully",
      data: bill,
    });
  } catch (err) {
    console.error("❌ UPDATE BILL ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to update bill",
      error: err.message,
    });
  }
};

/* ================= DELETE BILL ================= */
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
    console.error("❌ DELETE BILL ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to delete bill",
      error: err.message,
    });
  }
};

/* ================= GET LAST BILL ================= */
export const getLastBill = async (req, res) => {
  try {
    const { tenantId } = req.query;

    const bill = await Bill.findOne({
      where: { tenant_id: tenantId },
      order: [["id", "DESC"]],
    });

    return res.json({
      success: true,
      data: bill || null,
    });
  } catch (err) {
    console.error("❌ LAST BILL ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch last bill",
      error: err.message,
    });
  }
};
