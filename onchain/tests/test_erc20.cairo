use starknet::ContractAddress;
use core::traits::{TryInto};
use core::option::OptionTrait;
use core::result::ResultTrait;
use core::byte_array::{ByteArray};

use dewordle::interfaces::{IERC20Dispatcher,IERC20DispatcherTrait};


use snforge_std::{
    CheatSpan, ContractClassTrait, DeclareResultTrait, cheat_block_timestamp, declare,
    start_cheat_caller_address, stop_cheat_caller_address, start_cheat_block_timestamp,
    start_cheat_block_timestamp_global, stop_cheat_block_timestamp
};

fn RECIPIENT() -> ContractAddress {
   return 'RECIPIENT'.try_into().unwrap();
}

fn SPENDER() -> ContractAddress{
   return 'SPENDER'.try_into().unwrap();
}
fn OWNER() -> ContractAddress{
  return  'OWNER'.try_into().unwrap();
}

fn __deploy_DeWordle_erc20__(admin: ContractAddress) -> ContractAddress {
    let dewordle_erc20_class_hash = declare("DeWordleToken").unwrap().contract_class();
    let mut calldata = array![];
    admin.serialize(ref calldata);
    let (dewordle_erc20_contract_address, _) = dewordle_erc20_class_hash.deploy(@calldata).unwrap();
    return dewordle_erc20_contract_address;
}


#[test]
fn test_transfer_from(){
    let dewordle_erc20_contract_address = __deploy_DeWordle_erc20__(OWNER());
    let dewordle_erc20 = IERC20Dispatcher {contract_address: dewordle_erc20_contract_address};

    let spender = SPENDER();

    start_cheat_caller_address(dewordle_erc20_contract_address, spender);
    dewordle_erc20.name();
    dewordle_erc20.symbol();
    dewordle_erc20.decimals();
    stop_cheat_caller_address(dewordle_erc20_contract_address);
}