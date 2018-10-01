const headers = document.querySelectorAll(".filter__header");

headers.forEach(header => header.addEventListener("click", openDropdown));

function openDropdown(e){
	let dropdown = e.currentTarget.closest(".filter");
	dropdown.classList.toggle("filter--open");
}

const deleteBtns = document.querySelectorAll(".delete-group");
deleteBtns.forEach(btn => btn.addEventListener("click", deleteGroup));

function deleteGroup(e){
	let groupID = e.closest(".group").dataset.group;

	
}