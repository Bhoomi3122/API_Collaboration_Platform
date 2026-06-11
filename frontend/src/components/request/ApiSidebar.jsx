import { useState, useRef, useEffect } from "react";
import { Search, Plus, MoreVertical, Edit2, Trash2 } from "lucide-react";

const ApiSidebar = ({
	requests = [],
	loading = false,
	selectedId,
	onSelect,
	onNewRequest,
	onRename,
	onDelete
}) => {
	const [search, setSearch] = useState("");
	const [openMenuId, setOpenMenuId] = useState(null);
	const menuRef = useRef(null);

	// Filter flat request list by search
	const filtered = requests.filter(
		(r) =>
			r.name.toLowerCase().includes(search.toLowerCase()) ||
			r.method.toLowerCase().includes(search.toLowerCase())
	);

	// Close menu on outside click
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (menuRef.current && !menuRef.current.contains(event.target)) {
				setOpenMenuId(null);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleMenuToggle = (e, reqId) => {
		e.stopPropagation();
		setOpenMenuId(openMenuId === reqId ? null : reqId);
	};

	const handleRenameClick = (e, req) => {
		e.stopPropagation();
		setOpenMenuId(null);
		onRename(req);
	};

	const handleDeleteClick = (e, req) => {
		e.stopPropagation();
		setOpenMenuId(null);
		onDelete(req);
	};

	return (
		<aside className="cd-sidebar">
			{/* Search + New Request */}
			<div className="cd-sidebar-top">
				<div className="cd-search-wrapper">
					<Search className="cd-search-icon" size={14} />
					<input
						type="text"
						className="cd-search-input"
						placeholder="Search requests..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
				</div>
				<button className="cd-new-btn" onClick={onNewRequest}>
					<Plus size={14} />
					New Request
				</button>
			</div>

			{/* Request List */}
			<div className="cd-sidebar-list">
				{loading ? (
					<p className="cd-sidebar-empty">Loading requests...</p>
				) : filtered.length === 0 ? (
					<p className="cd-sidebar-empty">
						{requests.length === 0
							? "No requests in this collection yet."
							: "No requests match your search."}
					</p>
				) : (
					<div className="cd-group">
						<div className="cd-group-header">REQUESTS</div>
						<div className="cd-group-items">
							{filtered.map((req) => (
								<div
									key={req.id}
									className={`cd-request-item${selectedId === req.id ? " selected" : ""}`}
									onClick={() => onSelect(req)}
								>
									<span className={`cd-method-badge cd-method-${req.method}`}>
										{req.method}
									</span>
									<span className="cd-request-name">{req.name}</span>
									<div className="cd-request-menu-wrapper">
										<button
											className="cd-request-menu-btn"
											onClick={(e) => handleMenuToggle(e, req.id)}
										>
											<MoreVertical size={14} />
										</button>
										{openMenuId === req.id && (
											<div ref={menuRef} className="cd-request-menu-dropdown">
												<button
													className="cd-menu-item"
													onClick={(e) => handleRenameClick(e, req)}
												>
													<Edit2 size={14} />
													Rename
												</button>
												<button
													className="cd-menu-item cd-menu-item-danger"
													onClick={(e) => handleDeleteClick(e, req)}
												>
													<Trash2 size={14} />
													Delete
												</button>
											</div>
										)}
									</div>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</aside>
	);
};

export default ApiSidebar;
