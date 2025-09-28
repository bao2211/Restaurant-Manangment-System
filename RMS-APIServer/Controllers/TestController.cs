using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Cors;

namespace RMS_APIServer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableCors("AllowAll")]
    public class TestController : ControllerBase
    {
        // GET: api/Test
        [HttpGet]
        public IActionResult Get()
        {
            return Ok(new
            {
                message = "CORS test successful",
                timestamp = DateTime.UtcNow,
                method = "GET"
            });
        }

        // POST: api/Test
        [HttpPost]
        public IActionResult Post([FromBody] object data)
        {
            return Ok(new
            {
                message = "CORS POST test successful",
                timestamp = DateTime.UtcNow,
                method = "POST",
                receivedData = data
            });
        }

        // OPTIONS: api/Test (Handle preflight requests)
        [HttpOptions]
        public IActionResult Options()
        {
            return Ok(new
            {
                message = "CORS OPTIONS test successful",
                timestamp = DateTime.UtcNow,
                method = "OPTIONS"
            });
        }
    }
}