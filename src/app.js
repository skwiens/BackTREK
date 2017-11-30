// Vendor Modules
import $ from 'jquery';
import _ from 'underscore';

// CSS
import './css/foundation.css';
import './css/style.css';

//MODELS AND COLLECTIONS
import Trip from './app/models/trip';
import TripList from './app/collections/trip_list';

const $tripsList = $('#trips-list')
const $tripDescription = $('#trip-description')
const $newTripBtn = $('#newTripBtn');
const $addTripForm = $('#add-trip-form');
const $resFormBtn = $('#res-form-btn');
const $resForm = $('#reservation-form');
const $tripIDonForm = $('#tripID');

//templates
let tripTemplate;
let tripDetailsTemplate;

const tripList = new TripList();

// render trips table
const render = function render(tripList) {
  tripDetailsTemplate = _.template($('#trip-details-template').html());

  $tripsList.empty();
  tripList.forEach((trip) => {
    $tripsList.append(tripTemplate(trip.attributes));
  });
}

// const newTrip = function newTrip() {
//   console.log('button clicked!');
// }
const fields = ['name', 'category', 'continent', 'weeks', 'cost', 'about', 'tripID'];

const events = {
  addTrip(event){
    event.preventDefault();
    const tripData = {};

    fields.forEach( (field) => {
      const val = $(`input[name=${field}]`).val();
      if (val !== '' ) {
        tripData[field] = val;
      }
    });

    const trip = new Trip(tripData);

    if (trip.isValid()) {
      console.log('valid!')
      trip.save({}, {
        success: events.successfullSave,
        error: events.failedSave,
      });
    } else {
      console.log('uh oh! Invalid trip :(')
      console.log(trip.validationError);

      // TODO: FORMAT ERROR MESSGES!
      // multiple messages per key
      Object.keys(trip.validationError).forEach((error) => {
        $('#status-messages ul').append(`<li>${error}: ${trip.validationError[error]}</li>`)
      });
      $('#status-messages').show();
    }
  },
  successfullSave(trip, response) {
    console.log('Success!');
    console.log(trip);
    console.log(response);
    $('#status-messages ul').empty();
    $('#status-messages ul').append(`<li>${trip.get('name')} added!<li>`)
    $('#status-messages').show();
  },
  failedSave(trip, response) {
    console.log('errrrror!');
    console.log(trip);
    console.log(response);
    console.log(response.responseJSON.errors);

    for (let key in response.responseJSON.errors) {
      response.responseJSON.errors[key].forEach((error) => {
        $('#status-messages ul').append(`<li>${key}: ${error}</li>`)
      });
    }
    $('#status-messages').show();
    trip.destroy();
  },

}


$(document).ready( () => {

  tripTemplate = _.template($('#trip-template').html());


  // User Events
  $tripsList.on('click', 'tr', function getTrip() {
    const trip = new Trip({ id: $(this).attr('data-id') })
    $tripDescription.empty();
    trip.fetch().done(() => {
      $tripDescription.append(tripDetailsTemplate(trip.attributes));
    });
  });

  $('#trip-description').on('click', 'button', function showResForm() {
    console.log(this);
    const tripID = $(this).attr('data-id');
    console.log(tripID);
    $tripIDonForm.append(`<input type="hidden" name="tripID" value="${tripID}">`);
    $resForm.show();
  });

  $newTripBtn.on('click', function showNewTripForm() {
    $addTripForm.toggle();
  });

  $addTripForm.submit(events.addTrip);

  // Data Events
  tripList.on('update', render, tripList);

  // Implement when page loads
  tripList.fetch();
});
