import { useState } from "react";
import { Search, Plus } from "lucide-react";

const ApiSidebar = ({ requests = [], loading = false, selectedId, onSelect, onNewRequest }) => {
	const [search, setSearch] = useState("");

	// Filter flat request list by search
	const filtered = requests.filter(
		(r) =>
			r.name.toLowerCase().includes(search.toLowerCase()) ||
			r.method.toLowerCase().includes(search.toLowerCase())
	);

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
