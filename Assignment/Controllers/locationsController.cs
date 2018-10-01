using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.SqlClient;
using System.Linq;
using System.Net;
using System.Web.Mvc;
using System.Xml;
using Assignment.Models;
using Newtonsoft.Json;

namespace Assignment.Controllers
{
    public class locationsController : Controller
    {
        private Health db = new Health();

        // GET: locations
        public ActionResult Index()
        {
            ViewBag.location = new SelectList(db.locations, "id", "name");
            return View(db.locations.ToList());
        }

        // GET: locations/Details/5
        public ActionResult Details(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            location location = db.locations.Find(id);
            if (location == null)
            {
                return HttpNotFound();
            }
            return View(location);
        }

        // GET: locations/Create
        public ActionResult Create()
        {
            if (ModelState.IsValid)
            {
                String name = Request.QueryString["name"];
                String lat = Request.QueryString["latitude"];
                String lon = Request.QueryString["longitude"];

                Double latitude = Convert.ToDouble(Request.QueryString["latitude"]);
                Double longitude = Convert.ToDouble(Request.QueryString["longitude"]);

                if (name == null)
                    return View();

                location newLocation = new location();
                newLocation.id = db.locations.Max(l => l.id) + 1;
                newLocation.latitude = latitude;
                newLocation.longitude = longitude;
                newLocation.name = name;
                db.locations.Add(newLocation);
                db.SaveChanges();
                return RedirectToAction("Index");
            }

            return View();
        }

        public String getLatLng(string id)
        {
            //string id = Request.Params["hdnfldVariable"];
            int i = 0;
            if (!Int32.TryParse(id, out i))
            {
                i = -1;
            }
            return db.locations.Find(i).latitude+";"+ db.locations.Find(i).longitude;
        }

        public String saveJson(string value)
        {
            using (var webClient = new WebClient())
            {
                var jsonContent = webClient.DownloadString(value);
                var SteamDetails = JsonConvert.DeserializeObject<dynamic>(jsonContent);
                var coords = SteamDetails.trips[0].geometry.coordinates;

                route newRoute = new route();
                newRoute.id = db.routes.Count() == 0 ? 0 : (db.routes.Max(l => l.id) + 1);
                newRoute.length = 1; 
                newRoute.numOfLocation = coords.Count;

                db.routes.Add(newRoute);
                db.SaveChanges();
                foreach (var point in coords)
                {
                    Point newPoint = new Point();
                    newPoint.id = db.Points.Count() == 0 ? 0 : (db.Points.Max(l => l.id) + 1);
                    newPoint.latitude = point[1];
                    newPoint.longitude = point[0];
                    newPoint.route_id = newRoute.id;

                    db.routes.Find(newRoute.id).Points.Add(newPoint);

                    db.Points.Add(newPoint);
                    db.SaveChanges();
                }
                
                db.SaveChanges();


            }

            return value.ToString();

            //var states = ((JObject)value["states"]["2009"]).Properties().Select(x => new { StateCode = x.Name,
                //Rate = Convert.ToDecimal(x.Value.ToString()) });

        }
        // POST: locations/Create
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for 
        // more details see https://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Create([Bind(Include = "id,name,latitude,longitude")] location location)
        {
            if (ModelState.IsValid)
            {
                db.locations.Add(location);
                db.SaveChanges();
                return RedirectToAction("Index");
            }

            return View(location);
        }


        // GET: locations/Edit/5
        public ActionResult Edit(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            location location = db.locations.Find(id);
            if (location == null)
            {
                return HttpNotFound();
            }
            return View(location);
        }

        // POST: locations/Edit/5
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for 
        // more details see https://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Edit([Bind(Include = "id,name,latitude,longitude")] location location)
        {
            if (ModelState.IsValid)
            {
                db.Entry(location).State = EntityState.Modified;
                db.SaveChanges();
                return RedirectToAction("Index");
            }
            return View(location);
        }

        // GET: locations/Delete/5
        public ActionResult Delete(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            location location = db.locations.Find(id);
            if (location == null)
            {
                return HttpNotFound();
            }
            return View(location);
        }

        // POST: locations/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public ActionResult DeleteConfirmed(int id)
        {
            location location = db.locations.Find(id);
            db.locations.Remove(location);
            db.SaveChanges();
            return RedirectToAction("Index");
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }
    }
}
