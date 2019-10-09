const data = require('./data.js')
const meals = data.meals
const vendors = data.vendors


// Given a vendor, the vendor's delivery schedule (of blackout periods), and the 
//number of its drivers determine whether or not it is available to deliver a meal.

// A vendor is available if:
// They have enough drivers for a concurrent delivery
// As long as the delivery blackout period doesn't overlap 


//sets the blackout period for a single delivery
const blackoutPeriod = (time, startMins = 30, endMins = 10) => {
  const start = new Date(time)
  start.setMinutes(start.getMinutes() - startMins)

  const end = new Date(time)
  end.setMinutes(end.getMinutes() + endMins)

  return [start, end]
}

//vendor schedules - arrs of blackout periods by vendorId
const makeScheduleHash = (meals) => {
  return meals.results.reduce((acc,meal) => {
    const deliveryPeriod = blackoutPeriod(meal.datetime) //[start, end]
    if(!acc[meal.vendor_id]){
      acc[meal.vendor_id] = [deliveryPeriod]
    }
    else {
      acc[meal.vendor_id].push(deliveryPeriod)
    }
    return acc
  },{})
}
const vendorScheds = makeScheduleHash(meals)

// number of drivers by vendorId
const makeDriverHash = (vendors) => {
  return vendors.results.reduce((acc,cur) => {
    acc[cur.vendor_id] = cur.drivers
    return acc
  },{})
}
const vendorDrivers = makeDriverHash(vendors)


const getMaxConcurrentSegments = (starts, ends) => {
  let maxOverlaps = 0, curOverlaps = 0;
  let i = 0, j = 0;

  starts = starts.sort()
  ends = ends.sort()

  while (i < starts.length && j < ends.length) {
    if (starts[i] < ends[j]) {
      curOverlaps++
      maxOverlaps = Math.max(maxOverlaps, curOverlaps)
      i++
    }
    else {
      curOverlaps--
      j++
    }
  }
  return maxOverlaps
}


exports.isVendorAvailable = (vendorId, datetime) => {
  if(!vendorScheds[vendorId]) return false;

  const numDrivers = vendorDrivers[vendorId]
  const vendorSched = vendorScheds[vendorId]
  
  const [checkStart, checkEnd] = blackoutPeriod(datetime)
  const overlapStartTimes = [], overlapEndTimes = []

  //collect arrays of start/end times of all overlapping segments
  for(var i = 0; i < vendorSched.length; i++){
    const [existingApptStart, existingApptEnd] = vendorSched[i]

    //if check slot overlaps existing appt push start and end to respective arrs
    if (checkStart < existingApptEnd && checkEnd > existingApptStart){
      const overlapStart = Math.max(checkStart, existingApptStart)
      overlapStartTimes.push(overlapStart)

      const overlapEnd = Math.min(checkEnd, existingApptEnd)
      overlapEndTimes.push(overlapEnd)
    }
  }

  if(overlapStartTimes.length < numDrivers) return true;

  const maxConcurSegments = getMaxConcurrentSegments(overlapStartTimes, overlapEndTimes)
  return maxConcurSegments < numDrivers
}
