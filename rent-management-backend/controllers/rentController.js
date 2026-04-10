import RentEntry from "../models/RentEntry.js";
import Tenant from "../models/Tenant.js";

/* GET ALL */
export const getRentEntries = async (req, res) => {
  try {
    const entries = await RentEntry.findAll({
      include: [
        {
          model: Tenant,
          as: "tenant",
          attributes: ["id", "name"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.json(entries);
  } catch (error) {
    console.log("GET ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

/* CREATE */
export const createRentEntry = async (req, res) => {
  try {
    const data = normalize(req.body);

    const entry = await RentEntry.create(data);
    res.json(entry);
  } catch (error) {
    console.log("CREATE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

/* UPDATE */
export const updateRentEntry = async (req, res) => {
  try {
    const { id } = req.params;

    const data = normalize(req.body);

    await RentEntry.update(data, { where: { id } });

    const updated = await RentEntry.findByPk(id);
    res.json(updated);
  } catch (error) {
    console.log("UPDATE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

/* DELETE */
export const deleteRentEntry = async (req, res) => {
  try {
    await RentEntry.destroy({ where: { id: req.params.id } });
    res.json({ message: "Deleted" });
  } catch (error) {
    console.log("DELETE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

/* 🔥 NORMALIZER */
const normalize = (body) => ({
  tenant_id: Number(body.tenant_id),
  building: body.building,
  room: body.room,
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
