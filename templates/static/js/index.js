function getDevices() {
  $.ajax({
    type: "get",
    url: "/api/devices",
    success: (data) => {
      $("#device-list").empty()
      data.forEach(device => {
        $("#device-list").append(deviceHTML(device));
      });
    }
  })
}

function deviceHTML(device) {
  return `<div data-device_id="${device.id}" class="device-card bg-white rounded-lg shadow-md p-4 mb-4 hover:shadow-xl transition-shadow duration-300">
            <h4 class="text-lg font-semibold text-gray-800 mb-2">Устройство: ${device.name}</h4>
            <p class="text-gray-600 mb-1"><strong>Версия:</strong> ${device.version}</p>
            <p class="text-gray-600 mb-1"><strong>Максимум АКБ:</strong> ${device.max_batteries}</p>
            <p class="text-gray-600 mb-1"><strong>Состояние:</strong> ${device.state ? 'Включено' : 'Выключено'}</p>
          </div>`
}

function batteryHTML(battery) {
  return `<div data-battery_id='${battery.id}' class="card-battery border rounded-lg p-4 mb-4 shadow-lg bg-white flex items-center justify-between">
            <div class="flex-1">
              <h3 class="text-xl font-semibold text-gray-800 mb-2">${battery.name}</h3>
              <p class="text-gray-600"><strong>Напряжение:</strong> ${battery.voltage}</p>
              <p class="text-gray-600"><strong>Емкость:</strong> ${battery.capacity}</p>
              <p class="text-gray-600"><strong>Срок службы (мес):</strong> ${battery.service_life}</p>
            </div>
            <div class="ml-4 flex space-x-2">
              <!-- Кнопка редактирования -->
              <button class="text-blue-500 hover:text-blue-700 p-2 rounded-full transition" title="Редактировать" data-battery_id='${battery.id}' id="editBattery">
                <!-- SVG иконка редактирования -->
                <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M11 4H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2v-5m-4-4l4-4m0 0L15 4m4 4L19 8"></path>
                </svg>
              </button>
              <!-- Кнопка удаления -->
              <button class="text-red-500 hover:text-red-700 p-2 rounded-full transition" title="Удалить" id="deleteBattery" data-battery_id='${battery.id}'">
                <!-- SVG иконка удаления -->
                <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 7H5m14 0l-1 12a2 2 0 01-2 2H8a2 2 0 01-2-2L5 7m5 4v6m4-6v6"></path>
                </svg>
              </button>
            </div>
          </div>`
} 

function getUser() {
  $.ajax({
    type: "GET", 
    url: "/users/me",
    success: (data) => {
      $('.user-name').text(data.email)
      $('.user-name-short').text(data.email[0])
    }
  })
}

$(document).ready(function () {
  getUser()
  getDevices()
  $("#logoutBtn").on('click', function () {
    $.ajax({
      url: '/auth/jwt/logout',
      type: 'POST',
      success: function (data) {
        window.location.href = "/login";
      },
    });
  })

  const $buttons = $('aside button');

  function setActive($btn) {
    $buttons.removeAttr('data-active').removeClass('bg-blue-50');
    $btn.attr('data-active', 'true').addClass('bg-blue-50');
    $(".content-area").addClass("hidden")
    $(".content-area[data-area='" + $btn.data("area") + "']").removeClass("hidden")
  }

  $('#btnBatteries').on('click', function () {
    const $btn = $(this);
    setActive($btn);
  });

  $('#btnDevices').on('click', function () {
    const $btn = $(this);
    setActive($btn);
  });
  function formDevice() {
    var state_val = $("#deviceStatus").find(":selected").attr("value");
    var name = $("#deviceName").val().trim();
    var version = $("#firmwareVersion").val().trim();
    var max_batteries = $("#max_batteries").val().trim();

    // Проверка на пустые поля
    if (!name || !version || !max_batteries) {
      $('#error-device-alert').html('Пожалуйста, заполните все обязательные поля');
      $('#error-device-alert').slideDown(300);
      $('#error-device-alert').delay(2000).slideUp();
      return null;  // Или можно вернуть что-то другое, чтобы сигнализировать об ошибке
    }

    return {
      name: name,
      version: version,
      state: state_val == "on" ? true : false,
      max_batteries: max_batteries
    };
  }
  $(document).on("click", "#add_device", function () {
    const data = formDevice()
    if (data) {
      $.ajax({
        type: "POST",
        url: "/api/device",
        contentType: 'application/json',
        async: true,
        data: JSON.stringify(data),
        success: (data) => {
          $('#deviceModal').addClass('hidden');
          $('#deviceName, #firmwareVersion, #deviceStatus, #max_batteries').val('');
          const device = data
          $("#device-list").append(deviceHTML(device));
        },
        error: function (xhr, status, error) {
          let message = "Ошибка запроса";
          try {
            const response = JSON.parse(xhr.responseText);
            if (response.detail) {
              message = response.detail;
            }
          } catch (e) {
          }
          $('#error-device-alert').html(message);
          $('#error-device-alert').slideDown(300);
          $('#error-device-alert').delay(2000).slideUp();
        }
      })
    }
  })
  $('#openModal').on('click', function () {
    $("#add_device").removeClass('hidden');
    $("#save_device").addClass('hidden');
    $(".modal-name").text("Добавить устройство")
    $('#deviceModal').removeClass('hidden');
  });

  // Закрытие модального окна по клику на крестик или вне окна
  $('#closeModal, #deviceModal').on('click', function (e) {
    if (e.target.id === 'closeModal' || e.target.id === 'deviceModal') {
      $('#deviceModal').addClass('hidden');
    }
  });


  // Закрытие меню по кнопке
  $('#close-menu').on('click', function () {
    $('#side-menu').removeClass('translate-x-0').addClass('translate-x-full');
  });

  // Можно добавить закрытие по клику вне меню
  $(document).on('click', function (e) {
    if (!$(e.target).closest('#side-menu, #device-list div, #deviceModal, #batteryModal').length) {
      $('#side-menu').removeClass('translate-x-0').addClass('translate-x-full');
    }
  });
  $(document).on("click", '.device-card', function () {
    var device_id = $(this).data("device_id")
    $.ajax({
      type: "GET",
      url: "/api/device/" + device_id,
      success: (data) => {
        const device = data
        $("#openBatteryModal").data("device_id", device.id)
        $('#device-info').html(`
          <div class="bg-white rounded-lg shadow p-4 space-y-4 border border-gray-200">
            <div class="flex items-center justify-between">
              <h3 class="text-xl font-semibold text-gray-800">Устройство</h3>
              <button class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow transition duration-200" data-device_id="${device.id}" id="edit-device">
                Изменить
              </button>
            </div>
            <div class="space-y-2">
              <div class="flex items-center space-x-2">
                <span class="font-semibold text-gray-700">Название:</span>
                <span class="text-gray-900">${device.name}</span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="font-semibold text-gray-700">Версия:</span>
                <span class="text-gray-900">${device.version}</span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="font-semibold text-gray-700">Состояние:</span>
                <span class="${device.state ? 'text-green-600' : 'text-red-600'} font-semibold">
                  ${device.state ? 'Включено' : 'Выключено'}
                </span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="font-semibold text-gray-700">Максимум АКБ:</span>
                <span class="text-gray-900">${device.max_batteries}</span>
              </div>
            </div>
          </div>
        `);

        const batteries = device.batteries
        $("#battery-list").empty();
        batteries.forEach((battery) => {
          $("#battery-list").append(batteryHTML(battery));
        });
        $('#side-menu').removeClass('translate-x-full').addClass('translate-x-0');
      }
    })
  })
  $(document).on("click", "#edit-device", function () {
    const device_id = $(this).data('device_id')
    $.ajax({
      type: "GET",
      url: "/api/device/" + device_id,
      success: (data) => {
        const device = data
        $("#add_device").addClass('hidden');
        $("#save_device").removeClass('hidden');
        $(".modal-name").text("Изменить устройство")
        $('#deviceModal').removeClass('hidden');

        var value = device.state ? "on" : "off"
        $("#deviceStatus").find("option[value='" + value + "']").prop("selected", true)
        $("#deviceName").val(device.name)
        $("#firmwareVersion").val(device.version)
        $("#max_batteries").val(device.max_batteries)
        $("#save_device").data("device_id", device.id)
      }
    })
  })

  $("#save_device").on('click', function () {
    var device_id = $(this).data("device_id")
    var data = formDevice()
    data['id'] = device_id
    console.log(data)
    $.ajax({
      type: "PUT",
      url: "/api/device",
      contentType: "application/json",
      data: JSON.stringify(data),
      success: (data) => {
        const device = data
        $('#deviceModal').addClass('hidden');
        $(`.device-card[data-device_id="${device.id}"]`).replaceWith(deviceHTML(device))

        $('#device-info').html(`
          <div class="bg-white rounded-lg shadow p-4 space-y-4 border border-gray-200">
            <div class="flex items-center justify-between">
              <h3 class="text-xl font-semibold text-gray-800">Устройство</h3>
              <button class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow transition duration-200" data-device_id="${device.id}" id="edit-device">
                Изменить
              </button>
            </div>
            <div class="space-y-2">
              <div class="flex items-center space-x-2">
                <span class="font-semibold text-gray-700">Название:</span>
                <span class="text-gray-900">${device.name}</span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="font-semibold text-gray-700">Версия:</span>
                <span class="text-gray-900">${device.version}</span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="font-semibold text-gray-700">Состояние:</span>
                <span class="${device.state ? 'text-green-600' : 'text-red-600'} font-semibold">
                  ${device.state ? 'Включено' : 'Выключено'}
                </span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="font-semibold text-gray-700">Максимум АКБ:</span>
                <span class="text-gray-900">${device.max_batteries}</span>
              </div>
            </div>
          </div>
        `);
      }
    })
  })

  $("#openBatteryModal").on('click', function () {
    $("#batteryModal").removeClass("hidden")
    $("#add_battery").removeClass('hidden');
    $("#save_battery").addClass('hidden');
    $(".modal-battery-name").text("Добавить устройство")
    $("#add_battery").data("device_id", $(this).data("device_id"))
  })

  $('#closeModalBattery, #batteryModal').on('click', function (e) {
    if (e.target.id === 'closeModalBattery' || e.target.id === 'batteryModal') {
      $('#batteryModal').addClass('hidden');
    }
  });

  function formBattery() {
    var data = {
      name: $('#batteryName').val().trim(),
      voltage: $('#nominalVoltage').val().trim(),
      capacity: $('#residualCapacity').val().trim(),
      service_life: $("#serviceLife").val().trim()
    }

    if (!data.name || !data.voltage || !data.service_life || !data.capacity) {
      $('#error-battery-alert').html('Пожалуйста, заполните все обязательные поля');
      $('#error-battery-alert').slideDown(300);
      $('#error-battery-alert').delay(2000).slideUp();
      return null;  // Или можно вернуть что-то другое, чтобы сигнализировать об ошибке
    }

    return data
  }

  $("#add_battery").on("click", function() {
    var data = formBattery()
    if (data) {
      data['device_id'] = $(this).data("device_id")
      $.ajax({
        type: "POST",
        url: "/api/battery",
        contentType: "application/json",
        data: JSON.stringify(data),
        success: (data) => {
          $("#battery-list").append(batteryHTML(data));
        }, 
        error: function (xhr, status, error) {
          let message = 'Ошибка запроса';
          try {
            const response = JSON.parse(xhr.responseText);
            if (response.detail) {
              message = response.detail;
            }
          } catch (e) {
          }
          $('#error-battery-alert').html(message);
          $('#error-battery-alert').slideDown(300);
          $('#error-battery-alert').delay(2000).slideUp();
        }
      })
    }
  })

  $(document).on("click", "#deleteBattery", function() {
    var battery_id = $(this).data('battery_id')
    $.ajax({
      type: "DELETE",
      url: "/api/battery/" + battery_id,
      success: (data) => {
        $(".card-battery[data-battery_id='" + battery_id +"']").remove()
      }
    })
  })

  $(document).on("click", "#editBattery", function() {
    var battery_id = $(this).data('battery_id')
    $.ajax({
      type: "GET",
      url: "/api/battery/" + battery_id,
      success: (data) => {

        $('#batteryName').val(data.name)
        $('#nominalVoltage').val(data.voltage)
        $('#residualCapacity').val(data.capacity)
        $("#serviceLife").val(data.service_life)

        $("#batteryModal").removeClass("hidden")
        $("#add_battery").addClass('hidden');
        $("#save_battery").removeClass('hidden');
        $("#save_battery").data("battery_id", battery_id)
        $(".modal-battery-name").text("Изменить АКБ")
      }
    })
  })

  $("#save_battery").on('click', function() {
    var data = formBattery()
    if (data) {
      var battery_id = $(this).data('battery_id')
      data['id'] = battery_id
      $.ajax({
        type: "PUT",
        url: "/api/battery",
        contentType: "application/json",
        data: JSON.stringify(data),
        success: (data) => {
          const battery = data
          $("#batteryModal").addClass("hidden")
          $(".card-battery[data-battery_id='" + battery_id +"']").replaceWith(batteryHTML(battery));
        }, 
        error: function (xhr, status, error) {
          let message = 'Ошибка запроса';
          try {
            const response = JSON.parse(xhr.responseText);
            if (response.detail) {
              message = response.detail;
            }
          } catch (e) {
          }
          $('#error-battery-alert').html(message);
          $('#error-battery-alert').slideDown(300);
          $('#error-battery-alert').delay(2000).slideUp();
        }
      })
    }
  })
})