import RentEntry from "../models/RentEntry.js";
import Tenant from "../models/Tenant.js";
import Building from "../models/Building.js";
import Room from "../models/Room.js";

/* ================= GET ALL ================= */
export const getRentEntries = async (req, res) => {
  try {
    const entries = await RentEntry.findAll({
      include: [
        {
          model: Tenant,
          as: "tenant",
          attributes: ["id", "name"],
          include: [
            {
              model: Building,
              as: "building",
              attributes: ["name"],
            },
            {
              model: Room,
              as: "room",
              attributes: ["room_number"],
            },
          ],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.json(entries);
  } catch (error) {
    console.log("GET ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch rent entries",
      error: error.message,
    });
  }
};

/* ================= CREATE ================= */
export const createRentEntry = async (req, res) => {
  try {
    const data = normalize(req.body);

    // 🔥 GET TENANT WITH RELATIONS
    const tenant = await Tenant.findByPk(data.tenant_id, {
      include: [
        { model: Building, as: "building", attributes: ["name"] },
        { model: Room, as: "room", attributes: ["room_number"] },
      ],
    });

    if (!tenant) {
      return res.status(404).json({
        message: "Tenant not found",
      });
    }

    // 🔥 FORCE CORRECT BUILDING & ROOM
    data.building = tenant.building?.name || "";
    data.room = tenant.room?.room_number || "";

    // 🔥 DUPLICATE CHECK
    const existing = await RentEntry.findOne({
      where: {
        tenant_id: data.tenant_id,
        month: data.month,
      },
    });

    if (existing) {
      return res.status(400).json({
        message: "Rent already added for this tenant and month",
      });
    }

    const entry = await RentEntry.create(data);

    res.status(201).json({
      message: "Rent entry created successfully",
      data: entry,
    });

  } catch (error) {
    console.log("CREATE ERROR:", error);

    res.status(500).json({
      message: "Failed to create rent entry",
      error: error.message,
    });
  }
};

/* ================= UPDATE ================= */
export const updateRentEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const data = normalize(req.body);

    // 🔥 GET TENANT WITH RELATIONS
    const tenant = await Tenant.findByPk(data.tenant_id, {
      include: [
        { model: Building, as: "building", attributes: ["name"] },
        { model: Room, as: "room", attributes: ["room_number"] },
      ],
    });

    if (!tenant) {
      return res.status(404).json({
        message: "Tenant not found",
      });
    }

    // 🔥 FORCE CORRECT VALUES AGAIN
    data.building = tenant.building?.name || "";
    data.room = tenant.room?.room_number || "";

    await RentEntry.update(data, { where: { id } });

    const updated = await RentEntry.findByPk(id);

    res.json({
      message: "Rent entry updated successfully",
      data: updated,
    });

  } catch (error) {
    console.log("UPDATE ERROR:", error);

    res.status(500).json({
      message: "Failed to update rent entry",
      error: error.message,
    });
  }
};

/* ================= DELETE ================= */
export const deleteRentEntry = async (req, res) => {
  try {
    const deleted = await RentEntry.destroy({
      where: { id: req.params.id },
    });

    if (!deleted) {
      return res.status(404).json({
        message: "Rent entry not found",
      });
    }

    res.json({
      message: "Rent entry deleted successfully",
    });

  } catch (error) {
    console.log("DELETE ERROR:", error);

    res.status(500).json({
      message: "Failed to delete rent entry",
      error: error.message,
    });
  }
};

/* ================= NORMALIZER ================= */
const normalize = (body) => ({
  tenant_id: Number(body.tenant_id),

  // ❌ DON'T TRUST FRONTEND → WILL OVERRIDE
  building: "",
  room: "",

  month: body.month,

  rent: Number(body.rent || 0),
  water: Number(body.water || 0),
  maintenance: Number(body.maintenance || 0),
  electricity: Number(body.electricity || 0),

  previous_due: Number(body.previous_due || 0),
  total: Number(body.total || 0),

  paid: Number(body.paid || 0),
  advance: Number(body.advance || 0),

  status: body.status || "not vacated",
  due: Number(body.due || 0),
});
