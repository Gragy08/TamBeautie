// Initial TinyMCE
const initialTinyMCE = () => {
  tinymce.init({
    selector: '[textarea-mce]',
    plugins: [
      'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 'link', 'lists', 'media', 'searchreplace', 'table', 'visualblocks', 'wordcount', 'checklist', 'mediaembed', 'casechange', 'formatpainter', 'pageembed', 'a11ychecker', 'tinymcespellchecker', 'permanentpen', 'powerpaste', 'advtable', 'advcode', 'advtemplate', 'uploadcare', 'mentions', 'tableofcontents', 'footnotes', 'mergetags', 'autocorrect', 'typography', 'inlinecss', 'markdown','importword', 'exportword', 'exportpdf'
    ],
    toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography uploadcare | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
  });
}
initialTinyMCE();
// End Initial TinyMCE

// Create an instance of Notyf
var notyf = new Notyf({
  duration: 3000,
  position: {
    x:'right',
    y:'top'
  },
  dismissible: true
});

const notifyData = sessionStorage.getItem("notify");
if(notifyData) {
  const { type, message } = JSON.parse(notifyData);
  if(type == "error") {
    notyf.error(message);
  } else if(type == "success") {
    notyf.success(message);
  }
  sessionStorage.removeItem("notify");
}

const drawNotify = (type, message) => {
  sessionStorage.setItem("notify", JSON.stringify({
    type: type,
    message: message
  }));
}

// contactCreateCategoryForm
const contactCreateCategoryForm = document.querySelector("#contactCreateCategoryForm");
if(contactCreateCategoryForm) {
  const validator = new JustValidate('#contactCreateCategoryForm');

  validator
    .addField('#name', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập tên khách hàng!',
      },
    ])
    .addField('#phone', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập số điện thoại!',
      },
    ])
    .addField('#dob', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập ngày sinh!',
      },
    ])
    .onSuccess((event) => {
      const name = event.target.name.value;
      const phone = event.target.phone.value;
      const dob = event.target.dob.value;
      const sex = event.target.sex.value;
      const description = event.target.description.value;

      // Tạo formData
      const formData = new FormData();
      formData.append("fullName", name);
      formData.append("phone", phone);
      formData.append("dob", dob);
      formData.append("sex", sex);
      formData.append("description", description);

      fetch(`/${pathAdmin}/contact/create`, {
        method: "POST",
        body: formData
      })
        .then(res => res.json())
        .then(data => {
          if(data.code == "error") {
            notyf.error(data.message);
          }

          if(data.code == "success") {
            drawNotify(data.code, data.message);
            location.reload();
          }
        })
    });
}
// End contactCreateCategoryForm

// contactEditForm
const contactEditForm = document.querySelector("#contactEditForm");
if(contactEditForm) {
  const validator = new JustValidate('#contactEditForm');

  validator
    .addField('#name', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập tên khách hàng!',
      },
    ])
    .addField('#phone', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập số điện thoại!',
      },
    ])
    .addField('#dob', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập ngày sinh!',
      },
    ])
    .onSuccess((event) => {
      const id = event.target.id.value;
      const name = event.target.name.value;
      const phone = event.target.phone.value;
      const dob = event.target.dob.value;
      const sex = event.target.sex.value;
      const description = event.target.description.value;

      // Tạo formData
      const formData = new FormData();
      formData.append("fullName", name);
      formData.append("phone", phone);
      formData.append("dob", dob);
      formData.append("sex", sex);
      formData.append("description", description);

      fetch(`/${pathAdmin}/contact/edit/${id}`, {
        method: "PATCH",
        body: formData
      })
        .then(res => res.json())
        .then(data => {
          if(data.code == "error") {
            notyf.error(data.message);
          }

          if(data.code == "success") {
            notyf.success(data.message);
          }
        })
    });
}
// End contactEditForm

// btn-generate-slug
const buttonGenerateSlug = document.querySelector("[btn-generate-slug]");
if(buttonGenerateSlug) {
  buttonGenerateSlug.addEventListener("click", () => {
    const modalName = buttonGenerateSlug.getAttribute("btn-generate-slug");
    const from = buttonGenerateSlug.getAttribute("from");
    const to = buttonGenerateSlug.getAttribute("to");
    const string = document.querySelector(`[name="${from}"]`).value;
    
    const dataFinal = {
      string: string,
      modalName: modalName
    };

    fetch(`/${pathAdmin}/helper/generate-slug`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(dataFinal)
    })
      .then(res => res.json())
      .then(data => {
        if(data.code == "error") {
          notyf.error(data.message);
        }

        if(data.code == "success") {
          document.querySelector(`[name="${to}"]`).value = data.slug;
        }
      })
  })
}
// End btn-generate-slug

// button-api
const listButtonApi = document.querySelectorAll("[button-api]");
if(listButtonApi.length > 0) {
  listButtonApi.forEach(button => {
    button.addEventListener("click", () => {
      const method = button.getAttribute("data-method");
      const api = button.getAttribute("data-api");

      fetch(api, {
        method: method || "GET"
      })
        .then(res => res.json())
        .then(data => {
          if(data.code == "error") {
            notyf.error(data.message);
          }

          if(data.code == "success") {
            drawNotify(data.code, data.message);
            location.reload();
          }
        })
    })
  })
}
// End button-api

// form-search
const formSearch = document.querySelector("[form-search]");
if(formSearch) {
  const url = new URL(window.location.href);

  formSearch.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = event.target.keyword.value;
    if(value) {
      url.searchParams.set("keyword", value);
    } else {
      url.searchParams.delete("keyword");
    }
    window.location.href = url.href;
  })

  // Hiển thị giá trị mặc định
  const valueCurrent = url.searchParams.get("keyword");
  if(valueCurrent) {
    formSearch.keyword.value = valueCurrent;
  }
}
// End form-search

// pagination
const pagination = document.querySelector("[pagination]");
if(pagination) {
  const url = new URL(window.location.href);

  pagination.addEventListener("change", () => {
    const value = pagination.value;
    if(value) {
      url.searchParams.set("page", value);
    } else {
      url.searchParams.delete("page");
    }
    window.location.href = url.href;
  })

  // Hiển thị giá trị mặc định
  const valueCurrent = url.searchParams.get("page");
  if(valueCurrent) {
    pagination.value = valueCurrent;
  }
}
// End pagination

// serviceCreateCategoryForm
const serviceCreateCategoryForm = document.querySelector("#serviceCreateCategoryForm");
if(serviceCreateCategoryForm) {
  const validator = new JustValidate('#serviceCreateCategoryForm');

  validator
    .addField('#name', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập tên dịch vụ!',
      },
    ])
    .addField('#price', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập giá của dịch vụ!',
      },
    ])
    .onSuccess((event) => {
      const name = event.target.name.value;
      const price = event.target.price.value;
      const description = event.target.description.value;

      // Tạo formData
      const formData = new FormData();
      formData.append("name", name);
      formData.append("price", price);
      formData.append("description", description);

      fetch(`/${pathAdmin}/service/create`, {
        method: "POST",
        body: formData
      })
        .then(res => res.json())
        .then(data => {
          if(data.code == "error") {
            notyf.error(data.message);
          }

          if(data.code == "success") {
            drawNotify(data.code, data.message);
            location.reload();
          }
        })
    });
}
// End serviceCreateCategoryForm

// serviceEditCategoryForm
const serviceEditCategoryForm = document.querySelector("#serviceEditCategoryForm");
if(serviceEditCategoryForm) {
  const validator = new JustValidate('#serviceEditCategoryForm');

  validator
    .addField('#name', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập tên dịch vụ!',
      },
    ])
    .addField('#price', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập giá của dịch vụ!',
      },
    ])
    .onSuccess((event) => {
      const id = event.target.id.value;
      const name = event.target.name.value;
      const price = event.target.price.value;
      const description = event.target.description.value;

      // Tạo formData
      const formData = new FormData();
      formData.append("name", name);
      formData.append("price", price);
      formData.append("description", description);

      fetch(`/${pathAdmin}/service/edit/${id}`, {
        method: "PATCH",
        body: formData
      })
        .then(res => res.json())
        .then(data => {
          if(data.code == "error") {
            notyf.error(data.message);
          }

          if(data.code == "success") {
            notyf.success(data.message);
          }
        })
    });
}
// End serviceEditCategoryForm

// bookingCreateForm
const bookingCreateForm = document.querySelector("#bookingCreateForm");
if(bookingCreateForm) {
  const validator = new JustValidate('#bookingCreateForm');

  validator
    .addField('#date', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập ngày khám của dịch vụ!',
      },
    ])

    // Hàm gắn validate cho tất cả service-item
    function addServiceValidation() {
      document.querySelectorAll(".service-item").forEach((item, index) => {
        const nameInput = item.querySelector(".service-name");
        const priceInput = item.querySelector(".service-price");
        const unitInput = item.querySelector(".service-unit");

        // để mỗi input có selector unique (bằng name + index)
        nameInput.setAttribute("data-validate", `service-name-${index}`);
        priceInput.setAttribute("data-validate", `service-price-${index}`);
        unitInput.setAttribute("data-validate", `service-unit-${index}`);

        validator
          .addField(`[data-validate="service-name-${index}"]`, [
            {
              rule: 'required',
              errorMessage: 'Vui lòng chọn tên dịch vụ!',
            },
          ])
          .addField(`[data-validate="service-price-${index}"]`, [
            {
              rule: 'required',
              errorMessage: 'Vui lòng nhập giá dịch vụ!',
            },
            {
              rule: 'number',
              errorMessage: 'Giá phải là số!',
            },
          ])
          .addField(`[data-validate="service-unit-${index}"]`, [
            {
              rule: 'required',
              errorMessage: 'Vui lòng nhập đơn vị!',
            },
          ]);
      });
    }

    // Gắn validate ban đầu
    addServiceValidation();

    // Khi thêm dịch vụ mới thì gắn validate cho nó
    document.getElementById("addServiceBtn").addEventListener("click", () => {
      setTimeout(() => addServiceValidation(), 0); // đợi clone xong rồi mới gắn
    });

    validator.onSuccess((event) => {
      const id = event.target.id.value;
      // const name = event.target.name.value;
      // const price = event.target.price.value;
      // const unit = event.target.unit.value;
      const promotion = event.target.promotion.value;
      const total = event.target.total.value;
      const deposit = event.target.deposit.value;
      const pay = event.target.pay.value;
      const date = event.target.date.value;
      const status = event.target.status.value;
      const description = event.target.description.value;

      // Lấy danh sách dịch vụ
      const serviceItems = bookingCreateForm.querySelectorAll(".service-item");
      // Tạo formData
      const formData = new FormData();

      serviceItems.forEach(item => {
        const name = item.querySelector(".service-name").value;
        const price = item.querySelector(".service-price").value;
        const unit = item.querySelector(".service-unit").value;

        formData.append("name[]", name);
        formData.append("price[]", price);
        formData.append("unit[]", unit);
      });

      // formData.append("name", name);
      // formData.append("price", price);
      // formData.append("unit", unit);
      formData.append("promotion", promotion);
      formData.append("total", total);
      formData.append("deposit", deposit);
      formData.append("pay", pay);
      formData.append("date", date);
      formData.append("status", status);
      formData.append("description", description);

      fetch(`/${pathAdmin}/booking/create/${id}`, {
        method: "POST",
        body: formData
      })
        .then(res => res.json())
        .then(data => {
          if(data.code == "error") {
            notyf.error(data.message);
          }

          if(data.code == "success") {
            drawNotify(data.code, data.message);
            location.reload();
          }
        })
    });
}
// End bookingCreateForm

// bookingEditForm
const bookingEditForm = document.querySelector("#bookingEditForm");
if(bookingEditForm) {
  const validator = new JustValidate('#bookingEditForm');

  validator
    .addField('#date', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập ngày khám của dịch vụ!',
      },
    ])

    // Hàm gắn validate cho tất cả service-item
    function addServiceValidation() {
      document.querySelectorAll(".service-item").forEach((item, index) => {
        const nameInput = item.querySelector(".service-name");
        const priceInput = item.querySelector(".service-price");
        const unitInput = item.querySelector(".service-unit");

        // để mỗi input có selector unique (bằng name + index)
        nameInput.setAttribute("data-validate", `service-name-${index}`);
        priceInput.setAttribute("data-validate", `service-price-${index}`);
        unitInput.setAttribute("data-validate", `service-unit-${index}`);

        validator
          .addField(`[data-validate="service-name-${index}"]`, [
            {
              rule: 'required',
              errorMessage: 'Vui lòng chọn tên dịch vụ!',
            },
          ])
          .addField(`[data-validate="service-price-${index}"]`, [
            {
              rule: 'required',
              errorMessage: 'Vui lòng nhập giá dịch vụ!',
            },
            {
              rule: 'number',
              errorMessage: 'Giá phải là số!',
            },
          ])
          .addField(`[data-validate="service-unit-${index}"]`, [
            {
              rule: 'required',
              errorMessage: 'Vui lòng nhập đơn vị!',
            },
          ]);
      });
    }

    // Gắn validate ban đầu
    addServiceValidation();

    // Khi thêm dịch vụ mới thì gắn validate cho nó
    document.getElementById("addServiceBtn").addEventListener("click", () => {
      setTimeout(() => addServiceValidation(), 0); // đợi clone xong rồi mới gắn
    });

    validator.onSuccess((event) => {
      const id_customer = event.target.id_customer.value;
      const id_booking = event.target.id_booking.value;
      // const name = event.target.name.value;
      // const price = event.target.price.value;
      // const unit = event.target.unit.value;
      const promotion = event.target.promotion.value;
      const total = event.target.total.value;
      const deposit = event.target.deposit.value;
      const pay = event.target.pay.value;
      const date = event.target.date.value;
      const status = event.target.status.value;
      const description = event.target.description.value;

      // Lấy danh sách dịch vụ
      const serviceItems = bookingEditForm.querySelectorAll(".service-item");
      // Tạo formData
      const formData = new FormData();

      serviceItems.forEach(item => {
        const name = item.querySelector(".service-name").value;
        const price = item.querySelector(".service-price").value;
        const unit = item.querySelector(".service-unit").value;

        formData.append("name[]", name);
        formData.append("price[]", price);
        formData.append("unit[]", unit);
      });

      // formData.append("name", name);
      // formData.append("price", price);
      // formData.append("unit", unit);
      formData.append("promotion", promotion);
      formData.append("total", total);
      formData.append("deposit", deposit);
      formData.append("pay", pay);
      formData.append("date", date);
      formData.append("status", status);
      formData.append("description", description);

  fetch(`/${pathAdmin}/booking/edit/${id_booking}`, {
        method: "POST",
        body: formData
      })
        .then(res => res.json())
        .then(data => {
          if(data.code == "error") {
            notyf.error(data.message);
          }

          if(data.code == "success") {
            drawNotify(data.code, data.message);
            location.reload();
          }
        })
    });
}
// End bookingEditForm

// Check-all cho booking
const checkAllBox = document.getElementById("check-all");
const bookingCheckboxes = document.querySelectorAll("input[name='bookingIds']");

if (checkAllBox && bookingCheckboxes.length > 0) {
  checkAllBox.addEventListener("change", function() {
    bookingCheckboxes.forEach(cb => cb.checked = checkAllBox.checked);
  });
}
// End Check-all cho booking

// Đổi trạng thái hàng loạt
const bulkStatusBtn = document.getElementById("bulk-status-confirm");
const bulkStatusSelect = document.querySelector("select[name='bulk-status']");

if (bulkStatusBtn && bulkStatusSelect) {
  bulkStatusBtn.addEventListener("click", async function() {
    const status = bulkStatusSelect.value;
    if (!status) {
      drawNotify("error", "Vui lòng chọn trạng thái!");
      // alert("Vui lòng chọn trạng thái!");
      location.reload();
      return;
    }
    // Lấy các booking đã chọn
    const checkedIds = Array.from(document.querySelectorAll("input[name='bookingIds']:checked"))
      .map(cb => cb.value);

    if (checkedIds.length === 0) {
      drawNotify("error", "Vui lòng chọn ít nhất một đơn khám!");
      // alert("Vui lòng chọn ít nhất một đơn khám!");
      location.reload();
      return;
    }

    // Gửi request đổi trạng thái (ví dụ PATCH tới /admin/booking/bulk-status)
    try {
      const res = await fetch(`/${pathAdmin}/booking/bulk-status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: checkedIds, status })
      });
      const data = await res.json();
      if (data.code === "success") {
        drawNotify(data.code, data.message);
        location.reload();
      } else {
        alert(data.message || "Có lỗi xảy ra!");
      }
    } catch (err) {
      alert("Có lỗi xảy ra!");
    }
  });
}
// End đổi trạng thái hàng loạt