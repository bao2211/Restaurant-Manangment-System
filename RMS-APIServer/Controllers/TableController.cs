using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RMS_APIServer.Models;

namespace RMS_APIServer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TableController : ControllerBase
    {
        private readonly DBContext _context;

        public TableController(DBContext context)
        {
            _context = context;
        }

        // GET: api/Table
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Table>>> GetTables()
        {
            return await _context.Tables.ToListAsync();
        }

        // GET: api/Table/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Table>> GetTable(string id)
        {
            var table = await _context.Tables.FindAsync(id);

            if (table == null)
            {
                return NotFound();
            }

            return table;
        }

        // GET: api/Table/available
        [HttpGet("available")]
        public async Task<ActionResult<IEnumerable<Table>>> GetAvailableTables()
        {
            return await _context.Tables
                .Where(t => t.Status != "Occupied")
                .ToListAsync();
        }

        // PUT: api/Table/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTable(string id, Table table)
        {
            if (id != table.TableId)
            {
                return BadRequest();
            }

            _context.Entry(table).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TableExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Table
        [HttpPost]
        public async Task<ActionResult<Table>> PostTable(Table table)
        {
            _context.Tables.Add(table);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (TableExists(table.TableId))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtAction("GetTable", new { id = table.TableId }, table);
        }

        // DELETE: api/Table/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTable(string id)
        {
            var table = await _context.Tables.FindAsync(id);
            if (table == null)
            {
                return NotFound();
            }

            // Store table info before deletion for response
            var deletedTableInfo = new
            {
                tableId = table.TableId,
                tableName = table.TableName,
                numOfSeats = table.NumOfSeats,
                status = table.Status
            };

            _context.Tables.Remove(table);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Table deleted successfully.",
                deletedTable = deletedTableInfo,
                deletedAt = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss UTC")
            });
        }

        private bool TableExists(string id)
        {
            return _context.Tables.Any(e => e.TableId == id);
        }
    }
}
