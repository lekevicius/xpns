// Note: Based in https://github.com/paulrberg/prb-proxy/blob/main/contracts/PRBProxy.sol

// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.4;

import "./IPRBProxy.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/// @notice Emitted when the caller is not the owner.
error PRBProxy__ExecutionNotAuthorized(address owner, address caller, address target, bytes4 selector);

/// @notice Emitted when execution reverted with no reason.
error PRBProxy__ExecutionReverted();

/// @notice Emitted when the caller is not the owner.
error PRBProxy__NotOwner(address owner, address caller);

/// @notice Emitted when the owner is changed during the DELEGATECALL.
error PRBProxy__OwnerChanged(address originalOwner, address newOwner);

/// @notice Emitted when passing an EOA or an undeployed contract as the target.
error PRBProxy__TargetInvalid(address target);

/// @title PRBProxy
/// @author Paul Razvan Berg
contract PRBProxy is IPRBProxy, ERC721 {
    /// PUBLIC STORAGE ///

    /// @inheritdoc IPRBProxy
    address public override owner;

    /// @inheritdoc IPRBProxy
    uint256 public override minGasReserve;

    /// INTERNAL STORAGE ///

    /// @notice Maps envoys to target contracts to function selectors to boolean flags.
    mapping(address => mapping(address => mapping(bytes4 => bool))) internal permissions;

    /// CONSTRUCTOR ///

    constructor() ERC721("ExpenseToken", "EXPENSE") {
        minGasReserve = 5_000;
        owner = msg.sender;
        emit TransferOwnership(address(0), msg.sender);
    }

    /// FALLBACK FUNCTION ///

    /// @dev Called when Ether is sent and the call data is empty.
    receive() external payable {}

    /// PUBLIC CONSTANT FUNCTIONS ///

    // NOTE: We don't use permissions now, we will check NFT owning and spending limits for now
    /// @inheritdoc IPRBProxy
    function getPermission(
        address envoy,
        address target,
        bytes4 selector
    ) external view override returns (bool) {
        return permissions[envoy][target][selector];
    }

    /// PUBLIC NON-CONSTANT FUNCTIONS ///

    /// @inheritdoc IPRBProxy
    function execute(address target, bytes calldata data) external payable override returns (bytes memory response) {
        // Check that the caller is either the owner or an envoy.
        // NOTE: We don't use permissions now, we will check NFT owning and spending limits for now
        // if (owner != msg.sender) {
        //     bytes4 selector;
        //     assembly {
        //         selector := calldataload(data.offset)
        //     }
        //     if (!permissions[msg.sender][target][selector]) {
        //         revert PRBProxy__ExecutionNotAuthorized(owner, msg.sender, target, selector);
        //     }
        // }

        // Check that the target is a valid contract.
        if (target.code.length == 0) {
            revert PRBProxy__TargetInvalid(target);
        }

        // Save the owner address in memory. This local variable cannot be modified during the DELEGATECALL.
        address owner_ = owner;

        // Reserve some gas to ensure that the function has enough to finish the execution.
        uint256 stipend = gasleft() - minGasReserve;

        // Check if caller owns Expense NFT

        // Check if caller does not exceeded spending limit

        // Delegate call to the target contract.
        bool success;
        (success, response) = target.delegatecall{ gas: stipend }(data);

        // Check that the owner has not been changed.
        if (owner_ != owner) {
            revert PRBProxy__OwnerChanged(owner_, owner);
        }

        // Log the execution.
        emit Execute(target, data, response);

        // Check if the call was successful or not.
        if (!success) {
            // If there is return data, the call reverted with a reason or a custom error.
            if (response.length > 0) {
                assembly {
                    let returndata_size := mload(response)
                    revert(add(32, response), returndata_size)
                }
            } else {
                revert PRBProxy__ExecutionReverted();
            }
        }
    }

    /// @inheritdoc IPRBProxy
    function setPermission(
        address envoy,
        address target,
        bytes4 selector,
        bool permission
    ) external override {
        if (owner != msg.sender) {
            revert PRBProxy__NotOwner(owner, msg.sender);
        }
        permissions[envoy][target][selector] = permission;
    }

    /// @inheritdoc IPRBProxy
    function transferOwnership(address newOwner) external override {
        address oldOwner = owner;
        if (oldOwner != msg.sender) {
            revert PRBProxy__NotOwner(oldOwner, msg.sender);
        }
        owner = newOwner;
        emit TransferOwnership(oldOwner, newOwner);
    }
}