using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.SqlClient;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Mvc;
using Assignment.Models;
using Assignment.Utility;
using Microsoft.AspNet.Identity;


namespace Assignment.Controllers
{
    public class ReservationController : Controller
    {
        private Health db = new Health();
        private location selected;


        // GET: reservations
        [Authorize]
        public ActionResult Index()
        {
            var userId = User.Identity.GetUserId();
            var reservations = db.reservations.Include(r => r.AspNetUser).Include(r => r.location).Where(r => r.user_id == userId).ToList();
            return View(reservations.ToList());
        }

        // GET: reservations/Details/5
        public ActionResult Details(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            reservation reservation = db.reservations.Find(id);
            if (reservation == null)
            {
                return HttpNotFound();
            }
            return View(reservation);
        }

        // GET: reservations/Create
        [Authorize]
        public ActionResult Create()
        {
            String s = Request.QueryString["id"];
            int i = -1;
            Int32.TryParse(s, out i);
            ViewBag.id = db.reservations.Count() == 0 ? 0 : (db.reservations.Max(r => r.id) + 1);
            ViewBag.user_id = new SelectList(db.AspNetUsers, "Id", "Email");
            ViewBag.location_id = new SelectList(db.locations, "id", "name");
            if (s != null)
            {
                selected = db.locations.Find(i);
                ViewBag.location_id = new SelectList(db.locations, "id", "name", selected.id);
            }
            return View();
        }

        // POST: reservations/Create
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for 
        // more details see https://go.microsoft.com/fwlink/?LinkId=317598.

        public bool checkDateInRange(int location_id, DateTime time)
        {
            string connectionString = System.Configuration.ConfigurationManager.ConnectionStrings["Health"].ConnectionString;

            using (SqlConnection connection = new SqlConnection(connectionString))
            using (SqlCommand command = new SqlCommand("", connection))
            {
                if (connection.State == System.Data.ConnectionState.Closed)
                {
                    connection.Open();
                }
                command.CommandText = "select * from reservation where @time BETWEEN startDate AND endDate AND @location_id=location_id";
                command.Parameters.AddWithValue("@time", time);
                command.Parameters.AddWithValue("@location_id", location_id);
                SqlDataReader reader = command.ExecuteReader();
                if (reader.Read())//如果有该用户名
                {

                    if (connection.State != System.Data.ConnectionState.Closed)
                    {
                        connection.Close();
                        connection.Dispose();
                    }
                    return true;
                }

                if (connection.State != System.Data.ConnectionState.Closed)
                {
                    connection.Close();
                    connection.Dispose();
                }
                return false;
            }
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        [Authorize]
        public ActionResult Create([Bind(Include = "id,location_id,user_id,startDate,endDate")] reservation reservation)
        {
            reservation.user_id = User.Identity.GetUserId();
            ModelState.Clear();
            TryValidateModel(reservation);

            if (ModelState.IsValid)
            {
                if (checkDateInRange(reservation.location_id, reservation.startDate) )
                {
                    ViewBag.id = db.reservations.Count() == 0 ? 0 : (db.reservations.Max(r => r.id) + 1);
                    ViewBag.user_id = new SelectList(db.AspNetUsers, "Id", "Email", reservation.user_id);
                    ViewBag.location_id = new SelectList(db.locations, "id", "name", reservation.location_id);
                    ModelState.AddModelError("startDate", "This time has been already reservered!");
                    return View(reservation);
                }
                if (checkDateInRange(reservation.location_id, reservation.endDate))
                {
                    ViewBag.id = db.reservations.Count() == 0 ? 0 : (db.reservations.Max(r => r.id) + 1);
                    ViewBag.user_id = new SelectList(db.AspNetUsers, "Id", "Email", reservation.user_id);
                    ViewBag.location_id = new SelectList(db.locations, "id", "name", reservation.location_id);
                    ModelState.AddModelError("endDate", "This time has been already reservered!");
                    return View(reservation);
                }

                
                try
                {
                    String toEmail = db.AspNetUsers.Find(reservation.user_id).Email;
                    String subject = "Your Reservation has been successfully added in list!";
                    String contents = "Your Reservation has been successfully added in list! You can now check more detail in your reservation page.";

                    EmailSender es = new EmailSender();
                    es.Send(toEmail, subject, contents);

                    ViewBag.Result = "Email has been send.";

                    ModelState.Clear();

                    db.reservations.Add(reservation);
                    db.SaveChanges();

                    return RedirectToAction("Index");
                }
                catch
                {
                    ViewBag.id = db.reservations.Count() == 0 ? 0 : (db.reservations.Max(r => r.id) + 1);
                    ViewBag.user_id = new SelectList(db.AspNetUsers, "Id", "Email", reservation.user_id);
                    ViewBag.location_id = new SelectList(db.locations, "id", "name", reservation.location_id);
                    return View(reservation);
                }
            }
            ViewBag.user_id = new SelectList(db.AspNetUsers, "Id", "Email", reservation.user_id);
            ViewBag.location_id = new SelectList(db.locations, "id", "name", reservation.location_id);
            return View(reservation);
        }


        // GET: reservations/Edit/5
        public ActionResult Edit(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            reservation reservation = db.reservations.Find(id);
            if (reservation == null)
            {
                return HttpNotFound();
            }
            ViewBag.user_id = new SelectList(db.AspNetUsers, "Id", "Email", reservation.user_id);
            ViewBag.location_id = new SelectList(db.locations, "id", "name", reservation.location_id);
            return View(reservation);
        }

        // POST: reservations/Edit/5
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for 
        // more details see https://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        [Authorize]

        public ActionResult Edit([Bind(Include = "id,location_id,user_id,startDate,endDate")] reservation reservation)
        {
            if (ModelState.IsValid)
            {
                db.Entry(reservation).State = EntityState.Modified;
                db.SaveChanges();
                return RedirectToAction("Index");
            }
            ViewBag.user_id = new SelectList(db.AspNetUsers, "Id", "Email", reservation.user_id);
            ViewBag.location_id = new SelectList(db.locations, "id", "name", reservation.location_id);
            return View(reservation);
        }

        // GET: reservations/Delete/5
        public ActionResult Delete(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            reservation reservation = db.reservations.Find(id);
            if (reservation == null)
            {
                return HttpNotFound();
            }
            return View(reservation);
        }

        // POST: reservations/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public ActionResult DeleteConfirmed(int id)
        {
            reservation reservation = db.reservations.Find(id);
            db.reservations.Remove(reservation);
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
